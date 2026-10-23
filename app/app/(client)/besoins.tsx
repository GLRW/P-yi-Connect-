import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bouton, Chip, Pastille, Stepper, T, Vide } from '../../src/components/ui';
import { ESPECES } from '../../src/data/demo';
import { euro, FRAIS_LIVRAISON, kg, LIVRAISON_MIN_KG } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c, polices as f } from '../../src/theme';
import type { Demande } from '../../src/types';

// Espace pro : publier un besoin, que les vendeurs voient et acceptent
export default function Besoins() {
  const app = useApp();
  const pro = app.e.session?.pro;
  const [espece, setEspece] = useState('Igname');
  const [quantite, setQuantite] = useState(10);
  const [prix, setPrix] = useState(4);
  const [pour, setPour] = useState<Demande['pour']>('Demain');
  const [livrer, setLivrer] = useState(false);
  const [note, setNote] = useState('');
  const [publie, setPublie] = useState(false);
  if (!pro) return <SafeAreaView style={{ flex: 1 }}><Vide titre="Réservé aux professionnels" texte="Créez un compte pro pour publier vos besoins." /></SafeAreaView>;
  const livraisonPossible = quantite >= LIVRAISON_MIN_KG;
  const mes = app.mesDemandes();

  const publier = () => {
    app.posterDemande({ espece, kg: quantite, prixMaxKg: prix, pour, note: note.trim() || undefined,
      livraison: livrer && livraisonPossible ? { adresse: pro.adresse || pro.raison + ', ' + pro.commune, frais: FRAIS_LIVRAISON } : undefined });
    setNote(''); setPublie(true); setTimeout(() => setPublie(false), 3000);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 4 }}>
          <T tresGras style={{ fontSize: 24 }}>Mes besoins</T>
          <T gris>Dites ce qu’il vous faut : les vendeurs du secteur le voient et peuvent accepter. {pro.raison}.</T>
        </View>

        <View style={st.carte}>
          <T tresGras style={{ fontSize: 17 }}>Nouveau besoin</T>
          <T gras>Produit</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {ESPECES.map((x) => <Chip key={x} titre={x} actif={espece === x} onPress={() => setEspece(x)} />)}
          </ScrollView>
          <View style={st.ligne}>
            <T gras style={{ flex: 1 }}>Quantité</T>
            <Stepper valeur={kg(quantite)} onMoins={() => setQuantite((q) => Math.max(1, q - 1))} onPlus={() => setQuantite((q) => q + 1)} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
            {[5, 10, 20, 50].map((x) => <Chip key={x} titre={x + ' kg'} actif={quantite === x} onPress={() => setQuantite(x)} />)}
          </View>
          <View style={st.ligne}>
            <T gras style={{ flex: 1 }}>Prix maximum</T>
            <Stepper valeur={euro(prix) + '/kg'} onMoins={() => setPrix((p) => Math.max(1, p - 0.5))} onPlus={() => setPrix((p) => p + 0.5)} />
          </View>
          <View style={st.ligne}>
            <T gras style={{ flex: 1 }}>Pour</T>
            {(['Aujourd’hui', 'Demain'] as const).map((x) => <Chip key={x} titre={x} actif={pour === x} onPress={() => setPour(x)} style={{ marginLeft: 8 }} />)}
          </View>
          <T gras>Retrait ou livraison</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Choix titre="Je viens chercher" detail="Chez le vendeur" actif={!livrer} onPress={() => setLivrer(false)} />
            <Choix titre="Livraison" detail={livraisonPossible ? 'Par chauffeur · ' + euro(FRAIS_LIVRAISON) : 'Dès ' + LIVRAISON_MIN_KG + ' kg'} actif={livrer && livraisonPossible} desactive={!livraisonPossible} onPress={() => setLivrer(true)} />
          </View>
          {livrer && livraisonPossible ? <T gris petit>Livré à : {pro.adresse || pro.raison + ', ' + pro.commune}</T> : null}
          <TextInput value={note} onChangeText={setNote} placeholder="Précision (facultatif) : calibre, préparation, heure…" placeholderTextColor={c.grisClair} style={st.champ} />
          <T gris petit>Total maximum : {euro(quantite * prix + (livrer && livraisonPossible ? FRAIS_LIVRAISON : 0))}. Vous payez le poids réel à la réception.</T>
          <Bouton titre="Publier mon besoin" onPress={publier} />
          {publie ? <T gras style={{ color: c.vert }}>Besoin publié : les vendeurs sont prévenus.</T> : null}
        </View>

        <T tresGras style={{ fontSize: 17 }}>Mes besoins publiés</T>
        {!mes.length ? <T gris>Aucun besoin publié pour l’instant.</T> : null}
        {mes.map((d) => {
          const e = d.etalId ? app.etal(d.etalId) : undefined;
          return (
            <View key={d.id} style={[st.carte, { gap: 6 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T tresGras>{d.espece} · {kg(d.kg)}</T>
                <Pastille texte={d.statut === 'ouverte' ? 'En attente' : d.statut === 'acceptee' ? 'Acceptée' : 'Annulée'} style={{ backgroundColor: d.statut === 'acceptee' ? '#dff3ea' : c.doux }} />
              </View>
              <T gris petit>Max {euro(d.prixMaxKg)}/kg · {d.pour}{d.livraison ? ' · livraison par chauffeur' : ' · retrait chez le vendeur'}</T>
              {d.statut === 'acceptee' && e ? (
                <Pressable onPress={() => router.push({ pathname: '/bon/[code]', params: { code: d.bon! } })}><T tresGras style={{ textDecorationLine: 'underline' }}>Acceptée par {e.pecheur} ({e.port}) · voir la commande {d.bon}</T></Pressable>
              ) : null}
              {d.statut === 'ouverte' ? <Pressable onPress={() => app.annulerDemande(d.id)}><T gras gris style={{ textDecorationLine: 'underline' }}>Annuler</T></Pressable> : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Choix({ titre, detail, actif, desactive, onPress }: { titre: string; detail: string; actif: boolean; desactive?: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={desactive} onPress={onPress} style={{ flex: 1, borderRadius: 12, padding: 12, borderWidth: actif ? 2 : 1, borderColor: actif ? c.marine : c.ligne, backgroundColor: actif ? c.doux : '#fff', opacity: desactive ? 0.45 : 1 }}>
      <T tresGras>{titre}</T><T gris petit>{detail}</T>
    </Pressable>
  );
}

const st = StyleSheet.create({
  carte: { borderWidth: 1, borderColor: c.ligne, borderRadius: 16, padding: 14, gap: 12 },
  ligne: { flexDirection: 'row', alignItems: 'center' },
  champ: { minHeight: 48, borderRadius: 12, backgroundColor: c.doux, paddingHorizontal: 14, fontSize: 15, fontFamily: f.normal, color: c.texte },
});
