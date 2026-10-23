import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { heure } from '../format';
import { couleurs as c, polices as f } from '../theme';
import type { Conversation, Role } from '../types';
import { IcEnvoyer, IcVerrou } from './icones';
import { T } from './ui';

// Fil de discussion commun au client et au vendeur
export function Fil({ conv, moi, nomAutre, rapides, onEnvoyer, onPosition, avant }: {
  conv: Conversation; moi: Role; nomAutre: string; rapides: string[]; onEnvoyer: (t: string) => void;
  onPosition?: (m: { lat: number; lon: number; libelle: string }) => void; avant?: React.ReactNode;
}) {
  const [texte, setTexte] = useState('');
  const ref = useRef<ScrollView>(null);
  useEffect(() => { setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 50); }, [conv.messages.length]);
  const envoyer = (t: string) => { if (!t.trim()) return; onEnvoyer(t); setTexte(''); };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      {avant}
      <ScrollView ref={ref} contentContainerStyle={{ padding: 16, gap: 10 }}>
        <View style={{ alignSelf: 'center', flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: c.doux, borderRadius: 10, padding: 10, maxWidth: 300 }}>
          <IcVerrou couleur={c.gris} taille={14} />
          <T gris petit style={{ flex: 1, textAlign: 'center' }}>Messagerie ouverte après la réservation. Les numéros restent masqués.</T>
        </View>
        {conv.messages.map((m) => {
          if (m.auteur === 'systeme') return <T key={m.id} gris petit style={{ alignSelf: 'center', textAlign: 'center', backgroundColor: c.doux, padding: 8, borderRadius: 10, overflow: 'hidden' }}>{m.texte}</T>;
          const mien = m.auteur === moi;
          return (
            <View key={m.id} style={{ alignSelf: mien ? 'flex-end' : 'flex-start', maxWidth: '80%', gap: 3, alignItems: mien ? 'flex-end' : 'flex-start' }}>
              {m.position ? (
                <View style={{ width: 250, borderWidth: 1, borderColor: c.ligne, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' }}>
                  <View style={{ height: 90, backgroundColor: '#eceeec', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.marine, borderWidth: 3, borderColor: '#fff' }} />
                  </View>
                  <View style={{ padding: 10, gap: 8 }}>
                    <T tresGras>Position du vendeur</T>
                    <T gris petit>{m.position.libelle}</T>
                    {onPosition && !mien ? <Pressable onPress={() => onPosition(m.position!)} style={{ height: 38, borderRadius: 10, backgroundColor: c.marine, alignItems: 'center', justifyContent: 'center' }}><T tresGras style={{ color: '#fff' }}>Y aller</T></Pressable> : null}
                  </View>
                </View>
              ) : (
                <View style={{ backgroundColor: mien ? c.marine : c.doux, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomRightRadius: mien ? 4 : 18, borderBottomLeftRadius: mien ? 18 : 4 }}>
                  <T style={{ color: mien ? '#fff' : c.texte }}>{m.texte}</T>
                </View>
              )}
              <T petit style={{ color: c.grisClair, fontSize: 11 }}>{heure(m.heure)}</T>
            </View>
          );
        })}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 10 }}>
        {rapides.map((r) => <Pressable key={r} onPress={() => envoyer(r)} style={{ borderWidth: 1.5, borderColor: c.marine, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}><T gras petit>{r}</T></Pressable>)}
      </ScrollView>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: c.ligne }}>
        <TextInput value={texte} onChangeText={setTexte} placeholder={'Écrire à ' + nomAutre + '…'} placeholderTextColor={c.grisClair} onSubmitEditing={() => envoyer(texte)} returnKeyType="send"
          style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: c.doux, paddingHorizontal: 16, fontSize: 16, fontFamily: f.normal, color: c.texte }} />
        <Pressable accessibilityLabel="Envoyer" onPress={() => envoyer(texte)} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.marine, alignItems: 'center', justifyContent: 'center' }}>
          <IcEnvoyer couleur="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
