import { Redirect } from 'expo-router';
import { useApp } from '../src/store';

// Aiguillage : connexion, espace vendeur ou espace client
export default function Aiguillage() {
  const { e } = useApp();
  if (!e.session) return <Redirect href="/connexion" />;
  if (e.session.role === 'pecheur') return <Redirect href={e.session.statutPecheur === 'verifie' ? '/(pecheur)/arrivage' : '/inscription-pecheur'} />;
  return <Redirect href="/(client)" />;
}
