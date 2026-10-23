import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { Figtree_500Medium, Figtree_700Bold, Figtree_800ExtraBold, useFonts } from '@expo-google-fonts/figtree';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MagasinProvider, useApp } from '../src/store';

function Contenu() {
  const { pret } = useApp();
  if (!pret) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }} />;
}

export default function Racine() {
  const [polices] = useFonts({ BebasNeue_400Regular, Figtree_500Medium, Figtree_700Bold, Figtree_800ExtraBold });
  if (!polices) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  return (
    <SafeAreaProvider>
      <MagasinProvider>
        <StatusBar style="dark" />
        <Contenu />
      </MagasinProvider>
    </SafeAreaProvider>
  );
}
