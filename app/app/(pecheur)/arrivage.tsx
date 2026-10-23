import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IcCompte, IcMicro, IcPhoto } from '../../src/components/icones';
import { Bouton, Chip, Feuille, Logo, Rond, Stepper, T } from '../../src/components/ui';
import { ESPECES, famille } from '../../src/data/demo';
import { euro, heure, parUnite, qte } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';
import type { Origine, Unite } from '../../src/types';

type L = { espece: string; unite: Unite; origine: Origine; solAnalyse?: boolean; detail?: string; prixKg: number; dispoKg: number; preparations: { nom: string; supplementKg: number }[] };
const UNITES: Unite[] = ['kg', 'tas', 'lot', 'pièce', 'régime', 'paquet'];
const ORIGINES: Origine[] = ['Péyi', 'Caraïbe', 'Importé'];
const suivant = <X,>(liste: X[], x: X) => liste[(liste.indexOf(x) + 1) % liste.length];
const uniteParDefaut = (produit: string): Unite => ({ Racines: 'kg', Légumes: 'kg', Herbes: 'paquet', Fruits: 'pièce' } as Record<string, Unite>)[famille(produit)] ?? 'kg';

// Mon étal : publier en moins d'une minute. Unité, origine (obligatoire) et « sol analysé » pour les racines.
export default function Arrivage() {
  const app = useApp();
  const s = app.e.session!;
  const e = app.etal(s.etalId)!;
  const [lignes, setLignes] = useState<L[]>([]);
  const [ajout, setAjout] = useState(false);
  const [publie, setPublie] = useState(false);
  useEffect(() => { setLignes(e.produits.map((p) => ({ espece: p.espece, unite: p.unite, origine: p.origine, solAnalyse: p.solAnalyse, detail: p.detail, prixKg: p.prixKg, dispoKg: p.dispoKg, preparations: p.preparations }))); }, [e.id]);
  const aPreparer = app.bonsPecheur(s.etalId).filter((b) => b.statut === 'reserve').length;
  const maj = (i: number, f: (l: L) => L) => { setPublie(false); setLignes((ls) => ls.map((l, j) => (j === i ? f(l) : l))); };
  const bientot = (quoi: string) => (Platform.OS === 'web' ? undefined : Alert.alert(quoi, 'Bientôt disponible.'));
  const nbEnVente = lignes.filter((l) => l.dispoKg > 0).length;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Logo /><T gris>Bonjou {s.prenom}</T></View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip titre={aPreparer + ' à préparer'} onPress={() => router.navigate('/(pecheur)/reservations')} style={{ backgroundColor: c.accent, minHeight: 34 }} />
            <Rond label="Mon compte" onPress={() => router.push('/compte')}><IcCompte /></Rond>
          </View>
        </View>
        <T tresGras style={{ fontSize: 26 }}>Mon étal du jour</T>
        <T gris>{e.type} · {e.port} · retrait jusqu’à <T tresGras>{heure(e.limiteRetrait)}</T></T>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 4 }}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
          <Pressable onPress={() => bientot('Photo de la récolte')} style={{ flex: 1, minHeight: 70, borderRadius: 14, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center', gap: 6 }}><IcPhoto /><T gras>Photo de la récolte</T></Pressable>
          <Pressable onPress={() => bientot('Dicter mon étal')} style={{ flex: 1, minHeight: 70, borderRadius: 14, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center', gap: 6 }}><IcMicro /><T gras>Dicter mon étal</T></Pressable>
        </View>
        {lignes.map((l, i) => (
          <View key={l.espece} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.ligne, gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}><T tresGras style={{ fontSize: 16 }}>{l.espece}</T>{l.detail ? <T gris petit>{l.detail}</T> : null}</View>
              <Stepper valeur={qte(l.dispoKg, l.unite)} onMoins={() => maj(i, (x) => ({ ...x, dispoKg: Math.max(0, x.dispoKg - 1) }))} onPlus={() => maj(i, (x) => ({ ...x, dispoKg: x.dispoKg + 1 }))} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.ligne, borderRadius: 8, padding: 2, gap: 4 }}>
                <Pressable accessibilityLabel="Baisser le prix" onPress={() => maj(i, (x) => ({ ...x, prixKg: Math.max(0.5, x.prixKg - 0.5) }))} style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center' }}><T tresGras>−</T></Pressable>
                <T tresGras style={{ minWidth: 84, textAlign: 'center' }}>{euro(l.prixKg)}{parUnite(l.unite)}</T>
                <Pressable accessibilityLabel="Monter le prix" onPress={() => maj(i, (x) => ({ ...x, prixKg: x.prixKg + 0.5 }))} style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center' }}><T tresGras>+</T></Pressable>
              </View>
              <Chip titre={'Vendu : ' + (l.unite === 'kg' ? 'au kilo' : l.unite === 'pièce' ? 'à la pièce' : 'au ' + l.unite)} onPress={() => maj(i, (x) => ({ ...x, unite: suivant(UNITES, x.unite) }))} style={{ minHeight: 32 }} />
              <Chip titre={'Origine : ' + l.origine} actif={l.origine === 'Péyi'} onPress={() => maj(i, (x) => ({ ...x, origine: suivant(ORIGINES, x.origine) }))} style={{ minHeight: 32 }} />
              {famille(l.espece) === 'Racines' ? <Chip titre={l.solAnalyse ? 'Sol analysé ✓' : 'Sol non analysé'} actif={!!l.solAnalyse} onPress={() => maj(i, (x) => ({ ...x, solAnalyse: !x.solAnalyse }))} style={{ minHeight: 32 }} /> : null}
            </View>
          </View>
        ))}
        <Pressable onPress={() => setAjout(true)} style={{ paddingVertical: 14 }}><T tresGras>+ Ajouter un produit</T></Pressable>
        <View style={{ backgroundColor: c.doux, borderRadius: 12, padding: 12, gap: 4 }}>
          <T gris>Vos prix et quantités d’hier sont déjà remplis. Touchez « Vendu », « Origine » ou « Sol » pour changer.</T>
          <T gris petit>L’origine est obligatoire et vérifiée : un produit importé vendu comme péyi entraîne la suspension du compte.</T>
        </View>
        {publie ? <T gras style={{ color: c.vert, marginTop: 8 }}>Étal publié : les clients le voient tout de suite.</T> : null}
      </ScrollView>
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: c.ligne }}>
        <Bouton titre="Mettre en vente" desactive={!nbEnVente} droite={<T gras style={{ color: '#fff', opacity: 0.8 }}>{nbEnVente} produit{nbEnVente > 1 ? 's' : ''}</T>}
          onPress={() => { app.publierArrivage(e.id, lignes); setPublie(true); }} />
      </View>
      <Feuille visible={ajout} onFermer={() => setAjout(false)} titre="Ajouter un produit">
        {ESPECES.filter((x) => !lignes.some((l) => l.espece === x)).map((x) => (
          <Pressable key={x} onPress={() => { setLignes((ls) => [...ls, { espece: x, unite: uniteParDefaut(x), origine: 'Péyi', prixKg: 3, dispoKg: 10, preparations: [{ nom: 'Tel quel', supplementKg: 0 }] }]); setAjout(false); }}
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.ligne }}>
            <View><T tresGras>{x}</T><T gris petit>{famille(x)}</T></View><T tresGras>+</T>
          </Pressable>
        ))}
      </Feuille>
    </SafeAreaView>
  );
}
