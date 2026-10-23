import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IcCarte } from '../../src/components/icones';
import { Itineraire } from '../../src/components/Itineraire';
import { QR } from '../../src/components/QR';
import { Bouton, EnTete, Ligne, Pastille, T, Vide } from '../../src/components/ui';
import { PORTS } from '../../src/data/demo';
import { detailTva, euro, qte, TVA_PRODUITS_MER } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

export default function BonEcran() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const app = useApp();
  const [iti, setIti] = useState(false);
  const b = app.e.bons.find((x) => x.code === code);
  if (!b) return <SafeAreaView style={{ flex: 1 }}><EnTete titre="Bon de retrait" fermer /><Vide titre="Bon introuvable" texte="Retrouvez vos réservations dans « Mes bons »." /></SafeAreaView>;
  const e = app.etal(b.etalId)!;
  const p = PORTS[e.port];
  const retire = b.statut === 'retire';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.fond }}>
      <EnTete titre="Votre bon de retrait" sousTitre="Réservation confirmée · payée" fermer />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ margin: 16, marginBottom: 0, borderWidth: 1, borderColor: c.ligne, borderRadius: 16, padding: 18, gap: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 6 }}>
              <T gras gris petit style={{ letterSpacing: 1 }}>CODE À DONNER</T>
              <T tresGras style={{ fontSize: 50, letterSpacing: -1 }}>{b.code}</T>
              <Pastille texte={'Aujourd’hui · ' + b.creneau} />
            </View>
            <QR code={b.code} />
          </View>
          <Pastille texte={retire ? 'Retiré · payé ' + euro(b.montantPaye ?? 0) : 'À retirer · en attente de pesée'} style={retire ? { backgroundColor: '#dff3ea' } : { backgroundColor: c.doux }} />
          <Ligne />
          {b.lignes.map((l) => <View key={l.produitId} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T>{l.espece}</T><T tresGras>{qte(l.kg, l.unite)}</T></View>)}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T gris>{retire ? 'Payé (poids réel)' : 'Montant bloqué'}</T><T tresGras>{retire ? euro(b.montantPaye ?? 0) : euro(b.montantBloque) + ' max'}</T></View>
        </View>
        {b.pro ? (() => {
          const ttc = retire ? b.montantPaye ?? 0 : b.montantBloque; const t = detailTva(ttc);
          return (
            <View style={{ margin: 16, marginBottom: 0, borderRadius: 16, backgroundColor: c.doux, padding: 16, gap: 6 }}>
              <T tresGras style={{ fontSize: 16 }}>{retire ? 'Facture' : 'Facture (estimation)'} · {b.code}</T>
              <T>{b.pro.raison}</T>
              <T gris petit>SIRET {b.pro.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')} · {b.pro.commune}</T>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}><T>Montant HT</T><T>{euro(t.ht)}</T></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T>TVA {(TVA_PRODUITS_MER * 100).toFixed(1).replace('.', ',')} %</T><T>{euro(t.tva)}</T></View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T tresGras>Total TTC</T><T tresGras>{euro(t.ttc)}</T></View>
              <T gris petit>{retire ? 'Facture envoyée par e-mail et disponible dans votre compte.' : 'La facture définitive est établie au poids réel.'} Taux de TVA à confirmer avec le comptable.</T>
            </View>
          );
        })() : null}
        {b.livraison ? (
          <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
            <IcCarte />
            <View style={{ flex: 1, gap: 2 }}>
              <T tresGras style={{ fontSize: 16 }}>Livraison par chauffeur</T>
              <T gris>{b.livraison.adresse} · {b.creneau.toLowerCase()} · frais {euro(b.livraison.frais)}</T>
              <T gris petit>Le chauffeur récupère votre commande chez {e.pecheur} ({e.port}) et vous la livre. Vous serez prévenu à son départ.</T>
            </View>
          </View>
        ) : (
        <View style={{ flexDirection: 'row', gap: 12, padding: 16 }}>
          <IcCarte />
          <View style={{ flex: 1, gap: 2 }}>
            <T tresGras style={{ fontSize: 16 }}>{e.lieu}</T>
            <T gris>{e.pecheur} · {e.precision}</T>
          </View>
        </View>
        )}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16 }}>
          {b.livraison ? null : <Bouton titre="Itinéraire" style={{ flex: 1, height: 50 }} onPress={() => setIti(true)} />}
          <Bouton titre="Message" clair style={{ flex: 1, height: 50 }} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: e.id + '|Vous' } })} />
        </View>
        <T gris style={{ margin: 16 }}>{e.pecheur} pèse devant vous les produits vendus au kilo et valide le bon. Seul le poids réel est débité ; tas, lots et pièces sont à prix fixe.</T>
      </ScrollView>
      <Itineraire visible={iti} onFermer={() => setIti(false)} lieu={e.lieu ?? e.port} lat={p.lat} lon={p.lon} />
    </SafeAreaView>
  );
}
