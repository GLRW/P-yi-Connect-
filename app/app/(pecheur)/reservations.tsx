import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pastille, T, Vide } from '../../src/components/ui';
import { euro, qte } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

export default function Reservations() {
  const app = useApp();
  const bons = app.bonsPecheur(app.e.session?.etalId).slice().sort((a, b) => Number(a.statut !== 'reserve') - Number(b.statut !== 'reserve'));
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <View style={{ padding: 16, gap: 4 }}>
        <T tresGras style={{ fontSize: 24 }}>Réservations du jour</T>
        <T gris>Touchez un bon quand le client est devant vous : pesée des produits au kilo, puis validation.</T>
      </View>
      <ScrollView>
        {!bons.length ? <Vide titre="Pas encore de réservation" texte="Publiez votre arrivage : les réservations apparaîtront ici." /> : null}
        {bons.map((b) => (
          <Pressable key={b.code} onPress={() => router.push({ pathname: '/pesee/[code]', params: { code: b.code } })} style={{ padding: 16, gap: 6, borderBottomWidth: 1, borderBottomColor: c.ligne }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T tresGras style={{ fontSize: 18 }}>{b.code} · {b.pro ? b.pro.raison : b.client === 'Vous' ? 'Client démo' : b.client}</T>
              <Pastille texte={b.creneau} />
            </View>
            {b.pro ? <View style={{ flexDirection: 'row', gap: 6 }}><Pastille texte={'Pro · ' + b.pro.type} fonce />{b.livraison ? <Pastille texte="Livraison par chauffeur" style={{ backgroundColor: c.doux }} /> : null}</View> : null}
            <T gris petit>{b.lignes.map((l) => l.espece + ' ' + qte(l.kg, l.unite)).join(', ')}</T>
            <Pastille texte={b.statut === 'retire' ? 'Retiré · encaissé ' + euro(b.montantPaye ?? 0) : 'À préparer'} style={{ backgroundColor: b.statut === 'retire' ? '#dff3ea' : c.doux }} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
