import { router } from 'expo-router';
import { useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chip, Logo, Prix, T } from '../../src/components/ui';
import { FILTRES, PORTS, produitCorrespond } from '../../src/data/demo';
import { distanceKm, euro, heure } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

// Fond : carte OpenStreetMap (© contributeurs OpenStreetMap), calée sur le tracé réel de l'île.
// Dans la version installée sur téléphone, elle sera remplacée par une carte vivante (react-native-maps).
const W = 1055, H = 1280;
const xy = (lat: number, lon: number) => [(136108.0 + 2222.2 * lon) / W, (34232.374 - 2295.661 * lat) / H];

export default function Carte() {
  const app = useApp();
  const [filtre, setFiltre] = useState('Tout');
  const [port, setPort] = useState(app.e.commune);
  const [taille, setTaille] = useState({ w: 0, h: 0 });

  const garde = (portNom: string) => app.e.etals.filter((e) => e.port === portNom && e.produits.length > 0 && (
    filtre === 'Tout' ? true : filtre === 'Moins d’1 h' ? app.frais(e) : e.produits.some((p) => produitCorrespond(p, filtre) && p.dispoKg > 0)));
  const etalsPort = garde(port);

  const auLayout = (ev: LayoutChangeEvent) => {
    const { width, height } = ev.nativeEvent.layout;
    const h = Math.min(height, (width * H) / W);
    setTaille({ w: (h * W) / H, h });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: c.fond }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Logo />
          <View><T gris petit>Arrivages du jour</T><T tresGras style={{ fontSize: 17 }}>Martinique</T></View>
        </View>
        <View style={st.bascule}>
          <Pressable onPress={() => router.navigate('/(client)')} style={st.basc}><T gras gris>Liste</T></Pressable>
          <View style={[st.basc, { backgroundColor: c.marine }]}><T gras style={{ color: '#fff' }}>Carte</T></View>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 12 }} style={{ flexGrow: 0, flexShrink: 0, minHeight: 62 }}>
        {FILTRES.map((x) => <Chip key={x} titre={x} actif={filtre === x} onPress={() => setFiltre(x)} />)}
      </ScrollView>

      <View style={{ flex: 1, backgroundColor: '#e9eff1', alignItems: 'center', justifyContent: 'center' }} onLayout={auLayout}>
        {taille.w > 0 ? (
          <View style={{ width: taille.w, height: taille.h }}>
            <Image source={require('../../assets/carte-martinique.png')} style={{ width: taille.w, height: taille.h }} resizeMode="stretch" accessibilityLabel="Carte de la Martinique" />
            {Object.keys(PORTS).map((nom) => {
              const es = garde(nom); if (!es.length) return null;
              const [px, py] = xy(PORTS[nom].lat, PORTS[nom].lon);
              const frais = es.some(app.frais), choisi = nom === port;
              return (
                <Pressable key={nom} accessibilityLabel={nom + ', ' + es.length + ' étals'} onPress={() => setPort(nom)}
                  style={{ position: 'absolute', left: px * taille.w - 40, top: py * taille.h - 30, width: 80, alignItems: 'center' }}>
                  <View style={[st.repere, frais ? { backgroundColor: c.accent } : { backgroundColor: c.texte }, choisi && st.choisi]}>
                    <T tresGras style={{ fontSize: 11, color: frais ? c.surAccent : '#fff' }}>{nom === 'Fort-de-France' ? 'Marché · ' + es.length : es.length + ' étal' + (es.length > 1 ? 's' : '')}</T>
                  </View>
                  <View style={{ width: 2, height: 6, backgroundColor: frais ? c.accent : c.texte }} />
                </Pressable>
              );
            })}
            <View style={st.osm}><T gris style={{ fontSize: 10 }}>© Contributeurs OpenStreetMap</T></View>
          </View>
        ) : null}
      </View>

      <View style={st.volet}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <T tresGras style={{ fontSize: 17 }}>{port} · {etalsPort.length} étal{etalsPort.length > 1 ? 's' : ''}</T>
          <T gras gris petit>{distanceKm(PORTS[app.e.commune], PORTS[port])} km</T>
        </View>
        {etalsPort.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {etalsPort.map((e) => (
              <Pressable key={e.id} onPress={() => router.push({ pathname: '/etal/[id]', params: { id: e.id } })} style={[st.mini, { width: etalsPort.length > 1 ? 270 : 340 }]}>
                <T tresGras>Étal de {e.pecheur} · {String(e.note).replace('.', ',')} ★</T>
                <T gris petit numberOfLines={1}>{e.produits.map((p) => p.espece).join(', ')}</T>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  {app.minPrix(e) !== null ? <Prix texte={'dès ' + euro(app.minPrix(e)!) + '/kg'} /> : <View />}
                  <T gris petit>Arrivé {heure(e.debarque)}</T>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : <T gris>Aucun étal ne correspond au filtre dans cette commune. Touchez un autre repère.</T>}
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  bascule: { flexDirection: 'row', backgroundColor: c.doux, borderRadius: 999, padding: 3 },
  basc: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  repere: { borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3 },
  choisi: { borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 0, shadowOffset: { width: 0, height: 0 }, elevation: 3 },
  osm: { position: 'absolute', left: 6, top: 6, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  volet: { backgroundColor: '#fff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, paddingTop: 14, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 },
  mini: { borderWidth: 1, borderColor: c.ligne, borderRadius: 14, padding: 12, gap: 6 },
});
