import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { euro, heure } from '../format';
import { useApp } from '../store';
import { couleurs as c } from '../theme';
import type { Etal } from '../types';
import { Pastille, Prix, T, s } from './ui';

export function CarteEtal({ etal: e, large }: { etal: Etal; large?: boolean }) {
  const app = useApp();
  const frais = app.frais(e);
  const restant = e.produits.reduce((t, p) => t + p.dispoKg, 0);
  const mp = app.minPrix(e);
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/etal/[id]', params: { id: e.id } })} style={{ width: large ? '100%' : 260, gap: 5 }}>
      <View style={[s.photo, { height: large ? 150 : 130 }]}>
        <T gras gris petit style={{ letterSpacing: 1 }}>{e.port.toUpperCase()}</T>
        <View style={{ position: 'absolute', left: 10, top: 10 }}>
          {restant > 0 && restant <= 6
            ? <View style={{ backgroundColor: c.alerte, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}><T gras style={{ color: '#fff', fontSize: 12 }}>Bientôt épuisé</T></View>
            : <Pastille texte={'Arrivé ' + heure(e.debarque)} fonce={!frais} />}
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T tresGras style={{ fontSize: 16 }}>Étal de {e.pecheur}</T>
        <View style={{ backgroundColor: c.doux, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}><T gras petit>{String(e.note).replace('.', ',')} ★</T></View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <T gris numberOfLines={1} style={{ flexShrink: 1 }}>{e.produits.map((p) => p.espece).join(', ') || 'Pas encore d’arrivage'}</T>
        {mp !== null ? <Prix texte={'dès ' + euro(mp) + '/kg'} /> : null}
      </View>
      <T gris petit>{e.port} · {app.km(e)} km · retrait jusqu’à {heure(e.limiteRetrait)}</T>
    </Pressable>
  );
}
