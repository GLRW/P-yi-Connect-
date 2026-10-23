import * as Linking from 'expo-linking';
import { Platform, Pressable, View } from 'react-native';
import { couleurs as c } from '../theme';
import { Feuille, T } from './ui';

// Ouvre Waze, Google Maps ou Plans (iPhone) directement sur le point de retrait
export function Itineraire({ visible, onFermer, lieu, lat, lon }: { visible: boolean; onFermer: () => void; lieu: string; lat: number; lon: number }) {
  const applis = [
    { l: 'W', nom: 'Waze', detail: 'Trafic en temps réel', url: `https://waze.com/ul?ll=${lat},${lon}&navigate=yes` },
    { l: 'G', nom: 'Google Maps', detail: 'Voiture, à pied ou en bus', url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}` },
    ...(Platform.OS !== 'android' ? [{ l: 'P', nom: 'Plans', detail: 'L’appli de l’iPhone', url: `https://maps.apple.com/?daddr=${lat},${lon}` }] : []),
  ];
  return (
    <Feuille visible={visible} onFermer={onFermer} titre="Y aller avec…">
      <T gris style={{ marginBottom: 6 }}>{lieu}</T>
      {applis.map((a) => (
        <Pressable key={a.nom} accessibilityRole="link" onPress={() => { Linking.openURL(a.url); onFermer(); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.ligne }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center' }}><T tresGras style={{ fontSize: 18 }}>{a.l}</T></View>
          <View style={{ flex: 1 }}><T tresGras style={{ fontSize: 16 }}>{a.nom}</T><T gris petit>{a.detail}</T></View>
          <T tresGras gris style={{ fontSize: 20 }}>›</T>
        </Pressable>
      ))}
      <T gris petit style={{ marginTop: 12, textAlign: 'center' }}>L’adresse exacte n’apparaît qu’une fois la réservation payée.</T>
    </Feuille>
  );
}
