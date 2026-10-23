import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fil } from '../../src/components/Fil';
import { IcCarte, IcDirect } from '../../src/components/icones';
import { EnTete, Feuille, T, Vide } from '../../src/components/ui';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

// Conversation côté vendeur, avec l'envoi de sa position
export default function ConversationPecheur() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const [feuille, setFeuille] = useState(false);
  const conv = app.e.convs[id];
  useEffect(() => { if (conv && !conv.luPecheur) app.marquerLu(id, 'pecheur'); }, [conv?.messages.length]);
  if (!conv) return <SafeAreaView style={{ flex: 1 }}><EnTete titre="Messages" /><Vide titre="Conversation introuvable" texte="Revenez à la liste des messages." /></SafeAreaView>;
  const nom = conv.client === 'Vous' ? 'Client démo' : conv.client;
  const e = app.etal(conv.etalId)!;
  const option = (titre: string, detail: string, mode: 'direct' | 'une-fois' | 'habituel', principal?: boolean) => (
    <Pressable onPress={() => { app.envoyerPosition(id, mode); setFeuille(false); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: principal ? c.marine : c.doux }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: principal ? c.accent : '#fff', alignItems: 'center', justifyContent: 'center' }}>{mode === 'direct' ? <IcDirect /> : <IcCarte />}</View>
      <View style={{ flex: 1 }}><T tresGras style={{ color: principal ? '#fff' : c.texte, fontSize: 16 }}>{titre}</T><T petit style={{ color: principal ? '#fff' : c.gris, opacity: principal ? 0.8 : 1 }}>{detail}</T></View>
    </Pressable>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.fond }}>
      <EnTete titre={nom} sousTitre={'Bon ' + conv.bon} />
      <Fil conv={conv} moi="pecheur" nomAutre={nom} rapides={['C’est prêt', 'Je vous attends', 'À tout de suite']} onEnvoyer={(t) => app.envoyer(id, t, 'pecheur')}
        avant={<Pressable onPress={() => setFeuille(true)} style={{ margin: 16, marginBottom: 0, height: 46, borderRadius: 12, backgroundColor: c.marine, alignItems: 'center', justifyContent: 'center' }}><T tresGras style={{ color: '#fff' }}>Envoyer ma position</T></Pressable>} />
      <Feuille visible={feuille} onFermer={() => setFeuille(false)} titre="Envoyer ma position">
        {option('Partager en direct', 'Jusqu’à la fin du retrait', 'direct', true)}
        {option('Envoyer ma position actuelle', 'Une seule fois', 'une-fois')}
        {option('Mon point de vente habituel', e.lieu ?? e.port, 'habituel')}
        <T gris petit style={{ marginTop: 6 }}>Seuls vos clients du jour avec un bon payé voient votre position.</T>
      </Feuille>
    </SafeAreaView>
  );
}
