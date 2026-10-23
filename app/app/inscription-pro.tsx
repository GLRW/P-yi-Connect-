import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bouton, Chip, Logo, T } from '../src/components/ui';
import { PORTS } from '../src/data/demo';
import { useApp } from '../src/store';
import { couleurs as c, polices as f } from '../src/theme';
import type { InfosPro } from '../src/types';

const TYPES: InfosPro['type'][] = ['Restaurant', 'Épicerie', 'Cantine', 'Revendeur', 'Traiteur'];

// Inscription des clients professionnels : établissement + SIRET (pour les factures)
export default function InscriptionPro() {
  const app = useApp();
  const { tel } = useLocalSearchParams<{ tel?: string }>();
  const [prenom, setPrenom] = useState('');
  const [raison, setRaison] = useState('');
  const [type, setType] = useState<InfosPro['type']>('Restaurant');
  const [siret, setSiret] = useState('');
  const [commune, setCommune] = useState('Le Robert');
  const [adresse, setAdresse] = useState('');
  const siretOk = siret.replace(/\D/g, '').length === 14;
  const complet = prenom.trim() && raison.trim() && siretOk;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fond }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <Logo taille={30} />
        <View style={{ gap: 6 }}>
          <T tresGras style={{ fontSize: 24 }}>Compte professionnel</T>
          <T gris>Achetez en volume directement aux agriculteurs et marchands, avec une facture pour chaque commande.</T>
        </View>
        <Champ libelle="Votre prénom" valeur={prenom} onChange={setPrenom} exemple="Ex. Nathalie" />
        <Champ libelle="Nom de l’établissement" valeur={raison} onChange={setRaison} exemple="Ex. Restaurant Le Ti Lagon" />
        <View style={{ gap: 8 }}>
          <T gras>Type d’activité</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{TYPES.map((t) => <Chip key={t} titre={t} actif={type === t} onPress={() => setType(t)} />)}</View>
        </View>
        <View style={{ gap: 6 }}>
          <T gras>Numéro SIRET (14 chiffres)</T>
          <TextInput value={siret} onChangeText={(v) => setSiret(v.replace(/[^\d ]/g, '').slice(0, 17))} placeholder="Ex. 123 456 789 00012" keyboardType="number-pad" style={st.champ} />
          <T gris petit>Il apparaît sur vos factures. Nous le vérifions auprès de l’INSEE.</T>
        </View>
        <View style={{ gap: 8 }}>
          <T gras>Commune de l’établissement</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.keys(PORTS).map((p) => <Chip key={p} titre={p} actif={commune === p} onPress={() => setCommune(p)} />)}</View>
        </View>
        <Champ libelle="Adresse de livraison (facultatif)" valeur={adresse} onChange={setAdresse} exemple="Ex. 12 rue Schoelcher, Le Robert" />
        <Bouton titre="Créer mon compte pro" desactive={!complet}
          onPress={() => { app.connecterPro(tel ?? '', prenom.trim(), { raison: raison.trim(), type, siret: siret.replace(/\D/g, ''), commune, adresse: adresse.trim() || undefined }); router.replace('/(client)'); }} />
        <Bouton clair titre="Retour" onPress={() => router.replace('/connexion')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Champ({ libelle, valeur, onChange, exemple }: { libelle: string; valeur: string; onChange: (v: string) => void; exemple: string }) {
  return (
    <View style={{ gap: 6 }}>
      <T gras>{libelle}</T>
      <TextInput value={valeur} onChangeText={onChange} placeholder={exemple} style={st.champ} />
    </View>
  );
}

const st = StyleSheet.create({
  champ: { height: 52, borderRadius: 12, backgroundColor: c.doux, paddingHorizontal: 16, fontSize: 16, fontFamily: f.gras, color: c.texte },
});
