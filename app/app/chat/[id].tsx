import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fil } from '../../src/components/Fil';
import { Itineraire } from '../../src/components/Itineraire';
import { EnTete, Pastille, T, Vide } from '../../src/components/ui';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const [pos, setPos] = useState<{ lat: number; lon: number; libelle: string } | null>(null);
  const conv = app.e.convs[id];
  useEffect(() => { if (conv && !conv.luClient) app.marquerLu(id, 'client'); }, [conv?.messages.length]);
  if (!conv) return <SafeAreaView style={{ flex: 1 }}><EnTete titre="Messages" /><Vide titre="Conversation introuvable" texte="La messagerie s’ouvre quand vous réservez chez un vendeur." /></SafeAreaView>;
  const e = app.etal(conv.etalId)!;
  const b = app.e.bons.find((x) => x.code === conv.bon);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.fond }}>
      <EnTete titre={e.pecheur} sousTitre={'Étal de ' + e.port + ' · répond en ~5 min'} />
      <Fil conv={conv} moi="client" nomAutre={e.pecheur} rapides={['Vous êtes où ?', 'J’arrive dans 10 min', 'Je suis en retard', 'Merci !']}
        onEnvoyer={(t) => app.envoyer(id, t, 'client')} onPosition={(m) => setPos(m)}
        avant={b ? (
          <Pressable onPress={() => router.push({ pathname: '/bon/[code]', params: { code: b.code } })} style={{ margin: 16, marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: c.ligne, borderRadius: 12, padding: 12 }}>
            <T tresGras>{b.code}</T>
            <T gris petit style={{ flex: 1 }} numberOfLines={1}>{app.resume(b.lignes)}</T>
            <Pastille texte={b.creneau} />
          </Pressable>
        ) : <View />} />
      <Itineraire visible={!!pos} onFermer={() => setPos(null)} lieu={(e.lieu ?? e.port) + ' · ' + (pos?.libelle ?? '')} lat={pos?.lat ?? 0} lon={pos?.lon ?? 0} />
    </SafeAreaView>
  );
}
