import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bouton, Pastille, T, Vide } from '../../src/components/ui';
import { PORTS } from '../../src/data/demo';
import { distanceKm, euro, kg } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

// Les besoins publiés par les restaurants, épiceries, cantines et revendeurs
export default function BesoinsPros() {
  const app = useApp();
  const e = app.etal(app.e.session?.etalId);
  const liste = app.demandesOuvertes();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <View style={{ padding: 16, gap: 4 }}>
        <T tresGras style={{ fontSize: 24 }}>Besoins des pros</T>
        <T gris>Restaurants, épiceries et cantines qui cherchent des fruits et légumes. Acceptez : la commande est créée et payée par empreinte bancaire.</T>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 24 }}>
        {!liste.length ? <Vide titre="Aucun besoin en ce moment" texte="Les nouvelles demandes des professionnels apparaîtront ici." /> : null}
        {liste.map((d) => (
          <View key={d.id} style={{ borderWidth: 1, borderColor: c.ligne, borderRadius: 16, padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T tresGras style={{ fontSize: 17 }}>{d.espece} · {kg(d.kg)}</T>
              <Pastille texte={d.pour} />
            </View>
            <T>{d.pro.raison} <T gris>({d.pro.type.toLowerCase()}, {d.pro.commune}{e && PORTS[d.pro.commune] ? ' · ' + distanceKm(PORTS[e.port], PORTS[d.pro.commune]) + ' km' : ''})</T></T>
            <T tresGras>Jusqu’à {euro(d.prixMaxKg)}/kg · {euro(d.kg * d.prixMaxKg)} max</T>
            <T gris petit>{d.livraison ? 'Livraison par un chauffeur Péyi Connect : vous préparez, il passe récupérer chez vous.' : 'Le client vient chercher chez vous.'}</T>
            {d.note ? <T gris petit>« {d.note} »</T> : null}
            <Bouton titre="Je peux fournir" onPress={() => { if (e) { app.accepterDemande(d.id, e.id); router.navigate('/(pecheur)/reservations'); } }} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
