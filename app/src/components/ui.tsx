import { router } from 'expo-router';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { couleurs as c, polices as f, rayon } from '../theme';

export function T({ style, gras, tresGras, gris, petit, children, ...p }: React.ComponentProps<typeof Text> & { gras?: boolean; tresGras?: boolean; gris?: boolean; petit?: boolean }) {
  return (
    <Text {...p} style={[{ fontFamily: tresGras ? f.tresGras : gras ? f.gras : f.normal, color: gris ? c.gris : c.texte, fontSize: petit ? 13 : 15 }, style]}>
      {children}
    </Text>
  );
}

// En-tête de l'appli : « PÊCHE / CONNECT » en entier, trait vertical à droite (choix du porteur)
export function Logo({ taille = 22 }: { taille?: number }) {
  return (
    <View style={{ borderRightWidth: 3, borderRightColor: c.marine, paddingRight: 10, alignSelf: 'flex-start' }} accessibilityLabel="Péyi Connect">
      <Text style={{ fontFamily: f.logo, fontSize: taille, lineHeight: taille * 0.9, color: c.marine, letterSpacing: 1, paddingTop: 3 }}>PÉYI{'\n'}CONNECT</Text>
    </View>
  );
}

export function Bouton({ titre, onPress, clair, desactive, style, gauche, droite }: { titre: string; onPress?: () => void; clair?: boolean; desactive?: boolean; style?: ViewStyle; gauche?: React.ReactNode; droite?: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="button" disabled={desactive} onPress={onPress}
      style={({ pressed }) => [s.bouton, clair && { backgroundColor: c.doux }, desactive && { opacity: 0.35 }, pressed && { opacity: 0.8 }, (gauche || droite) ? { justifyContent: 'space-between' } : null, style]}>
      {gauche}
      <T tresGras style={{ color: clair ? c.texte : c.surMarine, fontSize: 16 }}>{titre}</T>
      {droite}
    </Pressable>
  );
}

export function Chip({ titre, actif, onPress, style }: { titre: string; actif?: boolean; onPress?: () => void; style?: ViewStyle }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!actif }} onPress={onPress} style={[s.chip, actif && { backgroundColor: c.marine }, style]}>
      <T gras style={{ color: actif ? c.surMarine : c.texte, fontSize: 14 }}>{titre}</T>
    </Pressable>
  );
}

export function Prix({ texte, style }: { texte: string; style?: TextStyle }) {
  return <T tresGras style={[s.prix, style]}>{texte}</T>;
}

export function Pastille({ texte, fonce, style }: { texte: string; fonce?: boolean; style?: ViewStyle }) {
  return (
    <View style={[s.pastille, fonce && { backgroundColor: c.marine }, style]}>
      <T gras style={{ fontSize: 12, color: fonce ? c.surMarine : c.surAccent }}>{texte}</T>
    </View>
  );
}

export function Rond({ onPress, label, children, blanc, style }: { onPress?: () => void; label: string; children: React.ReactNode; blanc?: boolean; style?: ViewStyle }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.rond, blanc && s.rondBlanc, style]}>
      {children}
    </Pressable>
  );
}

export function EnTete({ titre, sousTitre, fermer, droite }: { titre: string; sousTitre?: string; fermer?: boolean; droite?: React.ReactNode }) {
  return (
    <View style={s.entete}>
      <Rond label={fermer ? 'Fermer' : 'Retour'} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
        <T tresGras style={{ fontSize: 18 }}>{fermer ? '✕' : '‹'}</T>
      </Rond>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T tresGras style={{ fontSize: 17 }} numberOfLines={1}>{titre}</T>
        {sousTitre ? <T gris petit numberOfLines={1}>{sousTitre}</T> : null}
      </View>
      {droite}
    </View>
  );
}

export function Vide({ titre, texte, action, onAction }: { titre: string; texte: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ padding: 32, alignItems: 'center', gap: 10 }}>
      <T tresGras style={{ fontSize: 17, textAlign: 'center' }}>{titre}</T>
      <T gris style={{ textAlign: 'center' }}>{texte}</T>
      {action ? <Chip titre={action} actif onPress={onAction} /> : null}
    </View>
  );
}

export function Stepper({ valeur, onMoins, onPlus, onValeur }: { valeur: string; onMoins: () => void; onPlus: () => void; onValeur?: () => void }) {
  return (
    <View style={s.stepper}>
      <Pressable accessibilityLabel="Moins" onPress={onMoins} style={s.stepBtn}><T tresGras style={{ fontSize: 18 }}>−</T></Pressable>
      <Pressable accessibilityLabel="Régler la quantité" onPress={onValeur} style={{ minWidth: 56, alignItems: 'center' }}>
        <T tresGras style={{ textDecorationLine: onValeur ? 'underline' : 'none' }}>{valeur}</T>
      </Pressable>
      <Pressable accessibilityLabel="Plus" onPress={onPlus} style={[s.stepBtn, { backgroundColor: c.marine }]}><T tresGras style={{ fontSize: 18, color: c.surMarine }}>+</T></Pressable>
    </View>
  );
}

// Feuille qui monte du bas de l'écran
export function Feuille({ visible, onFermer, titre, children }: { visible: boolean; onFermer: () => void; titre: string; children: React.ReactNode }) {
  const ins = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onFermer}>
      <Pressable style={s.voile} onPress={onFermer} accessibilityLabel="Fermer" />
      <View style={[s.feuille, { paddingBottom: 22 + ins.bottom }]}>
        <View style={s.poignee} />
        <T tresGras style={{ fontSize: 19, marginBottom: 6 }}>{titre}</T>
        <ScrollView style={{ maxHeight: 520 }}>{children}</ScrollView>
      </View>
    </Modal>
  );
}

export function Ligne({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: c.ligne }, style]} />;
}

export const s = StyleSheet.create({
  bouton: { height: 54, borderRadius: 13, backgroundColor: c.marine, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, flexDirection: 'row', gap: 10 },
  chip: { minHeight: 38, paddingHorizontal: 14, borderRadius: rayon.pilule, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center' },
  prix: { backgroundColor: c.accent, color: c.surAccent, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: 'hidden', alignSelf: 'flex-start' },
  pastille: { backgroundColor: c.accent, borderRadius: rayon.pilule, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' },
  rond: { width: 42, height: 42, borderRadius: 21, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center' },
  rondBlanc: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.ligne, backgroundColor: c.fond },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.doux, borderRadius: rayon.pilule, padding: 4 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  voile: { flex: 1, backgroundColor: 'rgba(17,17,17,0.45)' },
  feuille: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 10 },
  poignee: { width: 40, height: 4, borderRadius: 4, backgroundColor: c.ligne, alignSelf: 'center', marginBottom: 12 },
  photo: { borderRadius: 12, backgroundColor: '#ebebe8', alignItems: 'center', justifyContent: 'center' },
});
