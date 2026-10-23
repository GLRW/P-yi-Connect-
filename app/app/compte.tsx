import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bouton, EnTete, T } from '../src/components/ui';
import { MODE_DEMO, useApp } from '../src/store';
import { couleurs as c } from '../src/theme';

export default function Compte() {
  const app = useApp();
  const s = app.e.session;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fond }}>
      <EnTete titre="Mon compte" fermer />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={{ gap: 2 }}>
          <T tresGras style={{ fontSize: 22 }}>{s?.prenom}</T>
          <T gris>{s?.role === 'pecheur' ? 'Vendeur professionnel' : s?.pro ? 'Client professionnel' : 'Client'} · numéro terminant par {s?.telephone.slice(-2)}</T>
        </View>
        {s?.pro ? <View style={{ backgroundColor: c.doux, borderRadius: 12, padding: 12, gap: 2 }}><T tresGras>{s.pro.raison}</T><T gris>{s.pro.type} · SIRET {s.pro.siret} · {s.pro.commune}</T>{s.pro.adresse ? <T gris>Livraison : {s.pro.adresse}</T> : null}</View> : null}
        {MODE_DEMO ? <T gris petit>Mode démo : les données restent sur ce téléphone, aucun paiement réel.</T> : null}
        <Bouton titre="Me déconnecter" onPress={() => { app.deconnecter(); router.replace('/connexion'); }} />
        {MODE_DEMO ? <Bouton clair titre="Recommencer la démo (tout effacer)" onPress={() => { app.reinitialiser(); router.replace('/connexion'); }} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
