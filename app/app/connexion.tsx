import { router } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bouton, Logo, T } from '../src/components/ui';
import { CODE_SMS_DEMO, MODE_DEMO, useApp } from '../src/store';
import { couleurs as c, polices as f } from '../src/theme';
import type { Role } from '../src/types';

// Connexion par numéro de téléphone + code reçu par SMS (Supabase Auth en production)
export default function Connexion() {
  const app = useApp();
  const [role, setRole] = useState<Role | 'pro'>('client');
  const [tel, setTel] = useState('');
  const [prenom, setPrenom] = useState('');
  const [etape, setEtape] = useState<'numero' | 'code'>('numero');
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const chiffres = tel.replace(/\D/g, '');
  const numeroOk = chiffres.length >= 10;

  const envoyerCode = () => { setErreur(''); setEtape('code'); };
  const valider = () => {
    if (code !== CODE_SMS_DEMO) { setErreur('Code incorrect. Vérifiez le SMS reçu' + (MODE_DEMO ? ' (démo : ' + CODE_SMS_DEMO + ').' : '.')); return; }
    if (role === 'pecheur') { router.replace({ pathname: '/inscription-pecheur', params: { tel: chiffres } }); return; }
    if (role === 'pro') { router.replace({ pathname: '/inscription-pro', params: { tel: chiffres } }); return; }
    app.connecter(chiffres, 'client', prenom.trim() || 'Client');
    router.replace('/(client)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fond }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 22 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 }}>
          <Logo taille={44} />
          <T tresGras style={{ fontSize: 17, lineHeight: 23 }}>Réservez.{'\n'}Payez.{'\n'}Récupérez.</T>
        </View>

        {etape === 'numero' ? (
          <>
            <View style={{ gap: 6 }}>
              <T tresGras style={{ fontSize: 24 }}>Bienvenue</T>
              <T gris>Les fruits et légumes péyi des agriculteurs et marchands de Martinique, réservés en quelques secondes.</T>
            </View>
            <View style={st.bascule} accessibilityRole="radiogroup">
              {([['client', 'Particulier'], ['pro', 'Professionnel'], ['pecheur', 'Vendeur']] as const).map(([r, libelle]) => (
                <Pressable key={r} accessibilityRole="radio" accessibilityState={{ checked: role === r }} onPress={() => setRole(r)} style={[st.choix, role === r && { backgroundColor: c.marine }]}>
                  <T tresGras style={{ color: role === r ? c.surMarine : c.texte, fontSize: 14 }}>{libelle}</T>
                </Pressable>
              ))}
            </View>
            {role === 'pro' ? <T gris petit style={{ marginTop: -12 }}>Restaurant, épicerie, cantine, traiteur : achats en volume et factures pour votre comptabilité.</T> : null}
            {role !== 'pecheur' ? (
              <View style={{ gap: 6 }}>
                <T gras>Votre prénom</T>
                <TextInput value={prenom} onChangeText={setPrenom} placeholder="Ex. Sophie" style={st.champ} autoComplete="given-name" />
              </View>
            ) : null}
            <View style={{ gap: 6 }}>
              <T gras>Votre numéro de téléphone</T>
              <TextInput value={tel} onChangeText={setTel} placeholder="0696 12 34 56" keyboardType="phone-pad" style={st.champ} autoComplete="tel" />
              <T gris petit>Nous vous envoyons un code par SMS. Votre numéro n’est jamais montré aux autres utilisateurs.</T>
            </View>
            <Bouton titre="Recevoir le code" onPress={envoyerCode} desactive={!numeroOk} />
          </>
        ) : (
          <>
            <View style={{ gap: 6 }}>
              <T tresGras style={{ fontSize: 24 }}>Code reçu par SMS</T>
              <T gris>Envoyé au {tel}. {MODE_DEMO ? 'Démo : tapez ' + CODE_SMS_DEMO + '.' : ''}</T>
            </View>
            <TextInput value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="••••••" keyboardType="number-pad" style={[st.champ, st.code]} autoComplete="sms-otp" textContentType="oneTimeCode" maxLength={6} />
            {erreur ? <T style={{ color: c.alerte }} gras>{erreur}</T> : null}
            <Bouton titre="Valider" onPress={valider} desactive={code.length !== 6} />
            <Pressable onPress={() => { setEtape('numero'); setCode(''); setErreur(''); }}><T gras style={{ textAlign: 'center', textDecorationLine: 'underline' }}>Changer de numéro</T></Pressable>
          </>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  ambiance: { width: '100%', height: 170, borderRadius: 16 },
  bascule: { flexDirection: 'row', backgroundColor: c.doux, borderRadius: 999, padding: 4, gap: 4 },
  choix: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 999 },
  champ: { height: 52, borderRadius: 12, backgroundColor: c.doux, paddingHorizontal: 16, fontSize: 17, fontFamily: f.gras, color: c.texte },
  code: { fontSize: 28, letterSpacing: 10, textAlign: 'center' },
});
