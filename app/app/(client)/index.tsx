import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarteEtal } from '../../src/components/CarteEtal';
import { IcCompte, IcLoupe } from '../../src/components/icones';
import { Chip, Feuille, Logo, Rond, T, Vide } from '../../src/components/ui';
import { FILTRES, PORTS, produitCorrespond } from '../../src/data/demo';
import { useApp } from '../../src/store';
import { couleurs as c, polices as f } from '../../src/theme';

export default function Accueil() {
  const app = useApp();
  const [filtre, setFiltre] = useState('Tout');
  const [q, setQ] = useState('');
  const [choixCommune, setChoixCommune] = useState(false);

  const liste = useMemo(() => app.e.etals.filter((e) => {
    if (filtre === 'Moins d’1 h' && !app.frais(e)) return false;
    if (filtre !== 'Tout' && filtre !== 'Moins d’1 h' && !e.produits.some((p) => produitCorrespond(p, filtre) && p.dispoKg > 0)) return false;
    const t = q.trim().toLowerCase();
    if (t && !(e.pecheur + ' ' + e.port + ' ' + e.produits.map((p) => p.espece).join(' ')).toLowerCase().includes(t)) return false;
    return e.produits.length > 0;
  }).sort((a, b) => app.km(a) - app.km(b)), [app, filtre, q]);
  const recents = liste.filter(app.frais);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Logo />
            <Pressable accessibilityRole="button" onPress={() => setChoixCommune(true)}>
              <T gris petit>Retrait près de</T>
              <T tresGras style={{ fontSize: 17 }}>{app.e.commune} ▾</T>
            </Pressable>
          </View>
          <Rond label="Mon compte" onPress={() => router.push('/compte')}><IcCompte /></Rond>
        </View>
        <View style={st.recherche}>
          <IcLoupe couleur={c.gris} taille={18} />
          <TextInput value={q} onChangeText={setQ} placeholder="Igname, mangue, une commune…" placeholderTextColor={c.grisClair} style={st.champ} accessibilityLabel="Rechercher" />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }} style={{ flexGrow: 0, flexShrink: 0, minHeight: 62 }}>
        {FILTRES.map((x) => <Chip key={x} titre={x} actif={filtre === x} onPress={() => setFiltre(x)} />)}
      </ScrollView>
      <ScrollView contentContainerStyle={{ paddingBottom: 24, gap: 20 }}>
        {filtre === 'Tout' && !q ? (
          <View style={st.bandeau}>
            
            <T tresGras style={{ color: '#fff', fontSize: 22, lineHeight: 26 }}>Les fruits et légumes péyi,{'\n'}en direct des producteurs</T>
            <T gras style={{ color: '#fff', opacity: 0.9 }}>{liste.length} étals ouverts ce matin · origine affichée sur chaque produit</T>
          </View>
        ) : null}
        {!liste.length ? (
          <Vide titre="Aucun étal ne correspond" texte="Essayez un autre produit ou effacez la recherche." action="Tout afficher" onAction={() => { setFiltre('Tout'); setQ(''); }} />
        ) : (
          <>
            {recents.length > 0 && filtre !== 'Moins d’1 h' ? (
              <View style={{ gap: 10 }}>
                <T tresGras style={st.h2}>Arrivé il y a moins d’une heure</T>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
                  {recents.map((e) => <CarteEtal key={e.id} etal={e} />)}
                </ScrollView>
              </View>
            ) : null}
            <View style={{ gap: 10 }}>
              <T tresGras style={st.h2}>{filtre === 'Tout' && !q ? 'Tous les étals du jour' : liste.length + ' étal' + (liste.length > 1 ? 's' : '') + ' trouvé' + (liste.length > 1 ? 's' : '')}</T>
              <View style={{ paddingHorizontal: 16, gap: 18 }}>{liste.map((e) => <CarteEtal key={e.id} etal={e} large />)}</View>
            </View>
          </>
        )}
      </ScrollView>
      <Feuille visible={choixCommune} onFermer={() => setChoixCommune(false)} titre="Retrait près de…">
        {Object.keys(PORTS).map((p) => (
          <Pressable key={p} onPress={() => { app.choisirCommune(p); setChoixCommune(false); }} style={st.option}>
            <T tresGras style={{ flex: 1 }}>{p}</T>{app.e.commune === p ? <T tresGras>✓</T> : null}
          </Pressable>
        ))}
      </Feuille>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  bandeau: { marginHorizontal: 16, height: 150, backgroundColor: c.marine, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end', padding: 16, gap: 4 },
  voile: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,53,91,0.45)' },
  recherche: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: c.doux, borderRadius: 999, paddingHorizontal: 16, height: 46 },
  champ: { flex: 1, fontSize: 16, fontFamily: f.normal, color: c.texte, height: 46 },
  h2: { fontSize: 19, paddingHorizontal: 16 },
  option: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.ligne },
});
