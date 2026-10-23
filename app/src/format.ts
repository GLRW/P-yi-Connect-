// Formats français : 14,00 €, 2,5 kg, 12 h 30
export const euro = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
export const kg = (n: number) => (Math.round(n * 10) / 10).toString().replace('.', ',') + ' kg';
export const heure = (m: number) => {
  const h = Math.floor(m / 60), mn = m % 60;
  return h + ' h' + (mn ? ' ' + String(mn).padStart(2, '0') : '');
};
export const maintenant = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

// Distance « à vol d'oiseau » majorée pour approcher la route
export function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371, r = Math.PI / 180;
  const dp = (b.lat - a.lat) * r, dl = (b.lon - a.lon) * r;
  const x = Math.sin(dp / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dl / 2) ** 2;
  return Math.max(1, Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 1.3));
}

// Montants : mêmes règles que le serveur (supabase/functions/_shared/montants.ts)
export const FRAIS_SERVICE = 0.9;
export const MARGE_EMPREINTE = 0.1; // on bloque 10 % de plus que l'estimation
export const estPese = (u: string) => u === 'kg';
// Quantité lisible : « 2,5 kg », « 3 tas », « 1 régime »
export const qte = (n: number, u: string) => (estPese(u) ? kg(n) : (Math.round(n * 10) / 10).toString().replace('.', ',') + ' ' + (n > 1 && !u.endsWith('s') ? u + 's' : u));
export const parUnite = (u: string) => '/' + u;
export const sousTotal = (lignes: { kg: number; prixKg: number; supplementKg: number }[]) =>
  lignes.reduce((s, l) => s + l.kg * (l.prixKg + l.supplementKg), 0);
// Livraison par chauffeur (pros) : montants provisoires, à fixer
export const LIVRAISON_MIN_KG = 10;
export const FRAIS_LIVRAISON = 15;

export const TVA_PRODUITS_MER = 0.021; // fruits et légumes : taux réduit Martinique, à confirmer // taux réduit Martinique : à confirmer avec un comptable
export const detailTva = (ttc: number) => { const ht = Math.round((ttc / (1 + TVA_PRODUITS_MER)) * 100) / 100; return { ht, tva: Math.round((ttc - ht) * 100) / 100, ttc }; };
export const montantBloque = (st: number) => Math.round((st * (1 + MARGE_EMPREINTE) + FRAIS_SERVICE) * 100) / 100;
// Seuls les produits pesés ont une marge (poids réel inconnu) ; tas, lots et pièces sont à prix fixe
export const montantBloqueLignes = (lignes: { kg: number; prixKg: number; supplementKg: number; unite?: string }[]) => {
  const pese = sousTotal(lignes.filter((l) => !l.unite || estPese(l.unite))), fixe = sousTotal(lignes.filter((l) => l.unite && !estPese(l.unite)));
  return Math.round((pese * (1 + MARGE_EMPREINTE) + fixe + FRAIS_SERVICE) * 100) / 100;
};
