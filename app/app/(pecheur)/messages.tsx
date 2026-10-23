import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { T, Vide } from '../../src/components/ui';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

export default function MessagesPecheur() {
  const app = useApp();
  const convs = Object.values(app.e.convs).filter((x) => x.etalId === app.e.session?.etalId);
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <T tresGras style={{ fontSize: 24, padding: 16 }}>Messages clients</T>
      <ScrollView>
        {!convs.length ? <Vide titre="Aucun message" texte="Vos clients peuvent vous écrire après leur réservation." /> : null}
        {convs.map((cv) => {
          const nom = cv.client === 'Vous' ? 'Client démo' : cv.client; const der = cv.messages[cv.messages.length - 1];
          return (
            <Pressable key={cv.id} onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: cv.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: c.ligne }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.marine, alignItems: 'center', justifyContent: 'center' }}><T tresGras style={{ color: '#fff' }}>{nom.slice(0, 2).toUpperCase()}</T></View>
              <View style={{ flex: 1 }}><T tresGras>{nom}</T><T gris petit numberOfLines={1}>{der ? (der.position ? 'Position partagée' : der.texte) : 'Bon ' + cv.bon}</T></View>
              {!cv.luPecheur ? <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}><T tresGras petit>1</T></View> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
