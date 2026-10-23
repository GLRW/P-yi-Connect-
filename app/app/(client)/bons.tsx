import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pastille, T, Vide } from '../../src/components/ui';
import { euro } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

export default function MesBons() {
  const app = useApp();
  const bons = app.mesBons();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <T tresGras style={{ fontSize: 24, padding: 16 }}>Mes bons</T>
      <ScrollView>
        {!bons.length ? <Vide titre="Aucun bon pour l’instant" texte="Quand vous réservez, votre bon de retrait apparaît ici avec son code." action="Voir les étals" onAction={() => router.navigate('/(client)')} /> : null}
        {bons.map((b) => {
          const e = app.etal(b.etalId);
          return (
            <Pressable key={b.code} onPress={() => router.push({ pathname: '/bon/[code]', params: { code: b.code } })} style={{ padding: 16, gap: 6, borderBottomWidth: 1, borderBottomColor: c.ligne }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T tresGras style={{ fontSize: 18 }}>{b.code}</T>
                <Pastille texte={b.creneau} />
              </View>
              <T>Étal de {e?.pecheur} · {e?.port}</T>
              <T gris petit>{app.resume(b.lignes)}</T>
              <Pastille texte={b.statut === 'retire' ? 'Retiré · payé ' + euro(b.montantPaye ?? 0) : 'À retirer · en attente de pesée'} style={{ backgroundColor: b.statut === 'retire' ? '#dff3ea' : c.doux }} />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
