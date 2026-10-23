import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ETALS_DEMO, PORTS } from './data/demo';
import { distanceKm, FRAIS_LIVRAISON, heure, kg, LIVRAISON_MIN_KG, montantBloque, montantBloqueLignes, qte, sousTotal } from './format';
import type { Bon, Conversation, Demande, Etal, InfosPro, LignePanier, Message, Origine, Panier, Role, Session, Unite } from './types';

// Mode démo : tout est stocké sur le téléphone. En production, chaque action
// passera par Supabase (voir src/services/backend.ts et supabase/).
export const MODE_DEMO = !process.env.EXPO_PUBLIC_SUPABASE_URL;
export const CODE_SMS_DEMO = '123456';
const CLE = 'peyi-connect-app-v1';
const HEURE_DEMO = 8 * 60 + 5; // en démo, l'horloge démarre à 8 h 05

type Etat = {
  session: Session;
  commune: string;
  etals: Etal[];
  panier: Panier;
  creneau: string | null;
  livraison: boolean;
  bons: Bon[];
  convs: Record<string, Conversation>;
  prochainCode: number;
  horloge: number;
  demandes: Demande[];
};

const etatInitial = (): Etat => ({
  session: null,
  commune: 'Le Robert',
  etals: JSON.parse(JSON.stringify(ETALS_DEMO)),
  panier: null,
  creneau: null,
  livraison: false,
  bons: [
    { code: 'R-25', etalId: 'jl', client: 'Sophie L.', lignes: [{ produitId: 'jl1', espece: 'Igname', unite: 'kg', kg: 3, prixKg: 4.5, preparation: 'Tel quel', supplementKg: 0 }], creneau: 'Avant 10 h', statut: 'reserve', montantBloque: 15.75, creeLe: 0 },
    { code: 'R-26', etalId: 'jl', client: 'Marc D.', lignes: [{ produitId: 'jl4', espece: 'Laitue', unite: 'pièce', kg: 2, prixKg: 1.5, preparation: 'Tel quel', supplementKg: 0 }, { produitId: 'jl3', espece: 'Giraumon', unite: 'kg', kg: 2, prixKg: 2.5, preparation: 'Tel quel', supplementKg: 0 }], creneau: '10 h – 12 h', statut: 'reserve', montantBloque: 9.4, creeLe: 0 },
  ],
  convs: {
    'jl|Sophie L.': { id: 'jl|Sophie L.', etalId: 'jl', client: 'Sophie L.', bon: 'R-25', luClient: true, luPecheur: false,
      messages: [{ id: 'm0', auteur: 'client', texte: 'Bonjour, je suis devant l’Habitation. Vous êtes où exactement ?', heure: 7 * 60 + 57 }] },
  },
  prochainCode: 27,
  horloge: HEURE_DEMO,
  demandes: [
    { id: 'd1', auteur: 'Chez Tante Arlette', pro: { raison: 'Restaurant Chez Tante Arlette', type: 'Restaurant', siret: '12345678900012', commune: 'Le Robert' }, espece: 'Igname', kg: 20, prixMaxKg: 4.5, pour: 'Demain', note: 'Sol analysé obligatoire, livraison avant 10 h', statut: 'ouverte', creeLe: 7 * 60 },
    { id: 'd2', auteur: 'Épicerie du Bourg', pro: { raison: 'Épicerie du Bourg', type: 'Revendeur', siret: '98765432100011', commune: 'Le François' }, espece: 'Christophine', kg: 15, prixMaxKg: 2.5, pour: 'Aujourd’hui', statut: 'ouverte', creeLe: 7 * 60 + 30 },
  ],
});

function creneauxDe(e: Etal) {
  const c = ['Avant 10 h'];
  if (e.limiteRetrait > 600) c.push('10 h – ' + (e.limiteRetrait >= 720 ? '12 h' : heure(e.limiteRetrait)));
  if (e.limiteRetrait > 720) c.push('12 h – ' + heure(e.limiteRetrait));
  return c;
}

// Réponses automatiques du vendeur, uniquement pour la démo
function reponseDemo(texte: string, e: Etal): Omit<Message, 'id' | 'heure'>[] {
  const t = texte.toLowerCase();
  if (/o[uù] [eê]tes|vous [eê]tes o[uù]|position|trouver/.test(t)) {
    const p = PORTS[e.port];
    return [{ auteur: 'pecheur', texte: 'Je vous envoie ma position.' }, { auteur: 'pecheur', position: { libelle: 'En direct jusqu’à ' + heure(e.limiteRetrait), lat: p.lat, lon: p.lon } }];
  }
  if (/retard/.test(t)) return [{ auteur: 'pecheur', texte: 'Pas de souci, je vous attends jusqu’à ' + heure(e.limiteRetrait) + '.' }];
  if (/arrive/.test(t)) return [{ auteur: 'pecheur', texte: 'Parfait, à tout de suite ! Je suis ' + (e.precision ?? 'à l’étal') + '.' }];
  if (/merci/.test(t)) return [{ auteur: 'pecheur', texte: 'Avec plaisir, bonne journée !' }];
  return [{ auteur: 'pecheur', texte: 'Bien reçu, merci !' }];
}

// Anti-contournement : les numéros de téléphone sont masqués dans la messagerie
export function masquerNumeros(t: string) {
  const re = /(\+?\d[\d .-]{7,}\d)/g;
  return { texte: t.replace(re, '•• •• •• •• ••'), masque: re.test(t) };
}

function useMagasin() {
  const [e, setE] = useState<Etat>(etatInitial);
  const [pret, setPret] = useState(false);
  const ref = useRef(e);
  ref.current = e;

  useEffect(() => {
    AsyncStorage.getItem(CLE).then((v) => { if (v) { try { setE({ ...etatInitial(), ...JSON.parse(v), demandes: JSON.parse(v).demandes ?? etatInitial().demandes }); } catch {} } }).finally(() => setPret(true));
  }, []);
  useEffect(() => { if (pret) AsyncStorage.setItem(CLE, JSON.stringify(e)).catch(() => {}); }, [e, pret]);

  const maj = (f: (x: Etat) => Etat) => setE((x) => f(JSON.parse(JSON.stringify(x))));
  const tic = (x: Etat) => (x.horloge += 1);

  const actions = useMemo(() => ({
    // --- Connexion (en production : Supabase Auth par SMS) ---
    connecter(telephone: string, role: Role, prenom: string) {
      maj((x) => ({ ...x, session: role === 'pecheur'
        ? { telephone, role, prenom, etalId: 'jl', statutPecheur: 'verifie', stripePret: true }
        : { telephone, role, prenom } }));
    },
    connecterPro(telephone: string, prenom: string, pro: InfosPro) {
      maj((x) => ({ ...x, session: { telephone, role: 'client', prenom, pro }, commune: PORTS[pro.commune] ? pro.commune : x.commune }));
    },
    inscrirePecheur(infos: { prenom: string; port: string; bateau: string; immatriculation: string; telephone: string; type?: Etal['type'] }) {
      maj((x) => {
        const id = 'moi';
        x.etals = x.etals.filter((t) => t.id !== id);
        x.etals.push({ id, pecheur: infos.prenom, type: infos.type ?? 'Agriculteur', port: infos.port, note: 5, avis: 0, bateau: infos.bateau, debarque: x.horloge, limiteRetrait: 12 * 60,
          lieu: infos.bateau + ', ' + infos.port, precision: 'à préciser par le vendeur', produits: [] });
        x.session = { telephone: infos.telephone, role: 'pecheur', prenom: infos.prenom, etalId: id, statutPecheur: 'en_attente', stripePret: false };
        return x;
      });
    },
    // --- Demandes des professionnels (en production : table « demandes » + notification aux vendeurs du secteur) ---
    posterDemande(d: { espece: string; kg: number; prixMaxKg: number; pour: Demande['pour']; note?: string; livraison?: Demande['livraison'] }) {
      maj((x) => { if (!x.session?.pro) return x; x.demandes.unshift({ ...d, id: 'd' + Date.now(), auteur: 'Vous', pro: x.session.pro, statut: 'ouverte', creeLe: x.horloge }); return x; });
    },
    annulerDemande(id: string) { maj((x) => { const d = x.demandes.find((y) => y.id === id); if (d && d.statut === 'ouverte') d.statut = 'annulee'; return x; }); },
    accepterDemande(id: string, etalId: string) {
      maj((x) => {
        const d = x.demandes.find((y) => y.id === id); if (!d || d.statut !== 'ouverte') return x;
        const code = 'R-' + x.prochainCode; x.prochainCode += 1;
        const lignes: LignePanier[] = [{ produitId: 'dem-' + id, espece: d.espece, unite: 'kg', kg: d.kg, prixKg: d.prixMaxKg, preparation: 'Tel quel', supplementKg: 0 }];
        const client = d.auteur;
        x.bons.push({ code, etalId, client, pro: d.pro, livraison: d.livraison, lignes, creneau: d.pour === 'Demain' ? 'Demain matin' : 'Aujourd’hui', statut: 'reserve', montantBloque: montantBloque(sousTotal(lignes)) + (d.livraison?.frais ?? 0), creeLe: x.horloge });
        d.statut = 'acceptee'; d.etalId = etalId; d.bon = code;
        const cid = etalId + '|' + client;
        x.convs[cid] = x.convs[cid] ?? { id: cid, etalId, client, bon: code, messages: [], luClient: false, luPecheur: true };
        x.convs[cid].bon = code;
        x.convs[cid].messages.push({ id: 'a' + Date.now(), auteur: 'pecheur', texte: 'Bonjour, je peux vous fournir ' + kg(d.kg) + ' de ' + d.espece.toLowerCase() + ' à ' + d.prixMaxKg.toFixed(2).replace('.', ',') + ' €/kg (' + d.pour.toLowerCase() + ')' + (d.livraison ? ', livré par un chauffeur à votre établissement' : '') + '. Commande ' + code + ' créée.', heure: tic(x) });
        x.convs[cid].luClient = false;
        return x;
      });
    },
    simulerVerification() { maj((x) => { if (x.session) x.session.statutPecheur = 'verifie'; return x; }); },
    simulerStripe() { maj((x) => { if (x.session) x.session.stripePret = true; return x; }); },
    deconnecter() { maj((x) => ({ ...x, session: null, panier: null })); },
    reinitialiser() { const s = etatInitial(); setE(s); },
    choisirCommune(c: string) { maj((x) => ({ ...x, commune: c })); },

    // --- Panier ---
    reglerKg(etalId: string, produitId: string, q: number) {
      maj((x) => {
        const et = x.etals.find((t) => t.id === etalId)!; const pr = et.produits.find((p) => p.id === produitId)!;
        q = Math.max(0, Math.min(pr.dispoKg, Math.round(q * 10) / 10));
        if (!x.panier || x.panier.etalId !== etalId) x.panier = { etalId, lignes: [] };
        let l = x.panier.lignes.find((y) => y.produitId === produitId);
        if (!l && q > 0) { l = { produitId, espece: pr.espece, unite: pr.unite, kg: 0, prixKg: pr.prixKg, preparation: pr.preparations[0].nom, supplementKg: pr.preparations[0].supplementKg }; x.panier.lignes.push(l); }
        if (l) l.kg = pr.unite === 'kg' ? q : Math.round(q);
        x.panier.lignes = x.panier.lignes.filter((y) => y.kg > 0);
        if (!x.panier.lignes.length) x.panier = null;
        return x;
      });
    },
    choisirPreparation(produitId: string, nom: string) {
      maj((x) => {
        const l = x.panier?.lignes.find((y) => y.produitId === produitId); if (!x.panier || !l) return x;
        const pr = x.etals.find((t) => t.id === x.panier!.etalId)!.produits.find((p) => p.id === produitId)!;
        const prep = pr.preparations.find((p) => p.nom === nom)!; l.preparation = prep.nom; l.supplementKg = prep.supplementKg; return x;
      });
    },
    viderPanier() { maj((x) => ({ ...x, panier: null })); },
    choisirCreneau(c: string) { maj((x) => ({ ...x, creneau: c })); },
    choisirLivraison(v: boolean) { maj((x) => ({ ...x, livraison: v })); },

    // --- Réservation (en production : fonction serveur « creer-reservation » + Stripe) ---
    reserver(): string | null {
      const x0 = ref.current; if (!x0.panier || !x0.session) return null;
      const code = 'R-' + x0.prochainCode;
      maj((x) => {
        const et = x.etals.find((t) => t.id === x.panier!.etalId)!;
        const lignes = x.panier!.lignes;
        lignes.forEach((l) => { const p = et.produits.find((q) => q.id === l.produitId)!; p.dispoKg = Math.round((p.dispoKg - l.kg) * 10) / 10; });
        const creneau = x.creneau && creneauxDe(et).includes(x.creneau) ? x.creneau : creneauxDe(et)[Math.min(1, creneauxDe(et).length - 1)];
        const totalKg = lignes.reduce((t, l) => t + l.kg, 0);
        const livraison = x.session?.pro && x.livraison && totalKg >= LIVRAISON_MIN_KG ? { adresse: x.session.pro.adresse || x.session.pro.raison + ', ' + x.session.pro.commune, frais: FRAIS_LIVRAISON } : undefined;
        x.bons.push({ code, etalId: et.id, client: 'Vous', pro: x.session?.pro, livraison, lignes, creneau: livraison ? 'Livraison ' + creneau.toLowerCase() : creneau, statut: 'reserve', montantBloque: montantBloqueLignes(lignes) + (livraison?.frais ?? 0), creeLe: x.horloge });
        x.livraison = false;
        const id = et.id + '|Vous';
        x.convs[id] = x.convs[id] ?? { id, etalId: et.id, client: 'Vous', bon: code, messages: [], luClient: true, luPecheur: false };
        x.convs[id].bon = code;
        x.panier = null; x.prochainCode += 1;
        return x;
      });
      setTimeout(() => maj((x) => {
        const b = x.bons.find((y) => y.code === code); if (!b) return x;
        const c = x.convs[b.etalId + '|Vous'];
        c.messages.push({ id: 'b' + code, auteur: 'pecheur', texte: 'Bonjour ! Bien reçu votre réservation ' + code + ', je vous prépare ça (' + b.creneau.toLowerCase() + ').', heure: tic(x) });
        c.luClient = false; return x;
      }), 2500);
      return code;
    },

    // --- Messagerie ---
    envoyer(convId: string, texte: string, auteur: Role) {
      texte = texte.trim(); if (!texte) return;
      const m = masquerNumeros(texte);
      maj((x) => {
        const c = x.convs[convId];
        c.messages.push({ id: 'm' + Date.now(), auteur, texte: m.texte, heure: tic(x) });
        if (m.masque) c.messages.push({ id: 's' + Date.now(), auteur: 'systeme', texte: 'Numéro masqué : les échanges restent sur Péyi Connect jusqu’au retrait.', heure: x.horloge });
        if (auteur === 'client') c.luPecheur = false; else c.luClient = false;
        return x;
      });
      if (auteur === 'client' && MODE_DEMO) {
        setTimeout(() => maj((x) => {
          const c = x.convs[convId]; const et = x.etals.find((t) => t.id === c.etalId)!;
          reponseDemo(texte, et).forEach((r, i) => c.messages.push({ ...r, id: 'r' + Date.now() + i, heure: tic(x) }));
          c.luClient = false; return x;
        }), 1300);
      }
    },
    envoyerPosition(convId: string, mode: 'direct' | 'une-fois' | 'habituel') {
      maj((x) => {
        const c = x.convs[convId]; const et = x.etals.find((t) => t.id === c.etalId)!; const p = PORTS[et.port];
        const libelle = mode === 'direct' ? 'En direct jusqu’à ' + heure(et.limiteRetrait) : mode === 'une-fois' ? 'Position envoyée à ' + heure(x.horloge) : 'Point de vente habituel · ' + et.lieu;
        c.messages.push({ id: 'p' + Date.now(), auteur: 'pecheur', position: { libelle, lat: p.lat, lon: p.lon }, heure: tic(x) });
        c.luClient = false; return x;
      });
    },
    marquerLu(convId: string, role: Role) {
      maj((x) => { const c = x.convs[convId]; if (!c) return x; if (role === 'client') c.luClient = true; else c.luPecheur = true; return x; });
    },

    // --- Espace vendeur ---
    publierArrivage(etalId: string, lignes: { espece: string; unite: Unite; origine: Origine; solAnalyse?: boolean; detail?: string; prixKg: number; dispoKg: number; preparations: { nom: string; supplementKg: number }[] }[]) {
      maj((x) => {
        const et = x.etals.find((t) => t.id === etalId)!;
        et.produits = lignes.filter((l) => l.dispoKg > 0).map((l, i) => ({ id: etalId + '-' + i + '-' + Date.now(), espece: l.espece, unite: l.unite, origine: l.origine, solAnalyse: l.solAnalyse, detail: l.detail, prixKg: l.prixKg, dispoKg: l.dispoKg, preparations: l.preparations }));
        et.debarque = x.horloge; return x;
      });
    },
    validerPesee(code: string, poids: number[]) {
      maj((x) => {
        const b = x.bons.find((y) => y.code === code)!;
        b.lignes.forEach((l, i) => (l.kg = poids[i]));
        b.montantPaye = Math.round((sousTotal(b.lignes) + 0.9) * 100) / 100;
        b.statut = 'retire'; return x;
      });
    },
  }), []);

  const sel = useMemo(() => ({
    etal: (id?: string) => e.etals.find((t) => t.id === id),
    frais: (t: Etal) => e.horloge - t.debarque < 60,
    depuis: (t: Etal) => { const d = e.horloge - t.debarque; return d < 60 ? 'il y a ' + d + ' min' : 'il y a ' + Math.floor(d / 60) + ' h' + (d % 60 ? ' ' + String(d % 60).padStart(2, '0') : ''); },
    km: (t: Etal) => distanceKm(PORTS[e.commune], PORTS[t.port] ?? PORTS['Le Robert']),
    minPrix: (t: Etal) => { const d = t.produits.filter((p) => p.dispoKg > 0); return d.length ? Math.min(...d.map((p) => p.prixKg)) : null; },
    kgPanier: (etalId: string, produitId: string) => (e.panier?.etalId === etalId ? e.panier.lignes.find((l) => l.produitId === produitId)?.kg ?? 0 : 0),
    creneaux: creneauxDe,
    mesBons: () => e.bons.filter((b) => b.client === 'Vous').slice().reverse(),
    mesDemandes: () => e.demandes.filter((d) => d.auteur === 'Vous'),
    // un pro ne voit pas ses propres besoins ici ; en démo, le vendeur voit aussi ceux publiés depuis ce téléphone
    demandesOuvertes: () => e.demandes.filter((d) => d.statut === 'ouverte' && !(e.session?.pro && d.auteur === 'Vous')),
    bonsPecheur: (etalId?: string) => e.bons.filter((b) => b.etalId === etalId),
    nonLusClient: () => Object.values(e.convs).filter((c) => c.client === 'Vous' && !c.luClient).length,
    nonLusPecheur: (etalId?: string) => Object.values(e.convs).filter((c) => c.etalId === etalId && !c.luPecheur).length,
    resume: (lignes: LignePanier[]) => lignes.map((l) => l.espece + ' ' + qte(l.kg, l.unite)).join(', '),
  }), [e]);

  return { e, pret, ...actions, ...sel };
}

type Magasin = ReturnType<typeof useMagasin>;
const Ctx = createContext<Magasin | null>(null);
export function MagasinProvider({ children }: { children: React.ReactNode }) {
  const m = useMagasin();
  return <Ctx.Provider value={m}>{children}</Ctx.Provider>;
}
export function useApp() {
  const m = useContext(Ctx);
  if (!m) throw new Error('useApp doit être utilisé dans MagasinProvider');
  return m;
}
