import { Redirect, Tabs } from 'expo-router';
import { IcArrivage, IcBons, IcCompte, IcMessages } from '../../src/components/icones';
import { useApp } from '../../src/store';
import { couleurs as c, polices as f } from '../../src/theme';

export default function OngletsPecheur() {
  const app = useApp();
  const s = app.e.session;
  if (!s || s.role !== 'pecheur') return <Redirect href="/connexion" />;
  if (s.statutPecheur !== 'verifie' || !s.stripePret) return <Redirect href="/inscription-pecheur" />;
  const aPreparer = app.bonsPecheur(s.etalId).filter((b) => b.statut === 'reserve').length;
  const nonLus = app.nonLusPecheur(s.etalId);
  const besoins = app.demandesOuvertes().length;
  return (
    <Tabs screenOptions={{
      headerShown: false, tabBarActiveTintColor: c.marine, tabBarInactiveTintColor: c.gris,
      tabBarLabelStyle: { fontFamily: f.gras, fontSize: 12, lineHeight: 16 },
      tabBarBadgeStyle: { backgroundColor: c.accent, color: c.surAccent, fontFamily: f.tresGras, fontSize: 11 },
      sceneStyle: { backgroundColor: c.fond },
      tabBarStyle: { height: 74, paddingTop: 6, paddingBottom: 14 },
      tabBarItemStyle: { paddingBottom: 2 },
    }}>
      <Tabs.Screen name="arrivage" options={{ title: 'Mon étal', tabBarIcon: ({ color }) => <IcArrivage couleur={color} /> }} />
      <Tabs.Screen name="reservations" options={{ title: 'Réservations', tabBarBadge: aPreparer || undefined, tabBarIcon: ({ color }) => <IcBons couleur={color} /> }} />
      <Tabs.Screen name="besoins" options={{ title: 'Besoins pros', tabBarBadge: besoins || undefined, tabBarIcon: ({ color }) => <IcCompte couleur={color} /> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarBadge: nonLus || undefined, tabBarIcon: ({ color }) => <IcMessages couleur={color} /> }} />
    </Tabs>
  );
}
