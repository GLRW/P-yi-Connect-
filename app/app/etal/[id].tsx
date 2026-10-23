import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IcVerrou } from '../../src/components/icones';
import { Bouton, Chip, Feuille, Pastille, Prix, Rond, Stepper, T, Vide, s } from '../../src/components/ui';
import { estPese, euro, heure, kg, parUnite, qte, sousTotal } from '../../src/format';
import { useApp } from '../../src/store';
import { couleurs as c } from '../../src/theme';

export default function EtalEcran() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const app = useApp();
  const e = app.etal(id);
  const [reglage, setReglage] = useState<{ produitId: string; kg: number } | null>(null);
  if (!e) return <SafeAreaView style={{ flex: 1 }}><Vide titre="Étal introuvable" texte="Il n’est peut-être plus en ligne aujourd’hui." action="Retour à l’accueil" onAction={() => router.replace('/(client)')} /></SafeAreaView>;

  const autre = app.e.panier && app.e.panier.etalId !== e.id;
  const nb = app.e.panier?.etalId === e.id ? app.e.panier.lignes.length : 0;
  const pro = !!app.e.session?.pro;
  const pas = (produitId: string, signe: 1 | -1) => {
    const q = app.kgPanier(e.id, produitId);
    const pese = estPese(e.produits.find((x) => x.id === produitId)!.unite);
    // au kilo : 1 kg puis pas de 500 g (1 kg pour les pros) ; à l'unité (tas, lot, pièce…) : pas de 1
    app.reglerKg(e.id, produitId, q === 0 && signe > 0 ? 1 : q + (!pese || pro ? 1 : 0.5) * signe);
  };
  const prodReglage = reglage ? e.produits.find((p) => p.id === reglage.produitId) : undefined;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: c.fond }}>
      <ScrollView>
        <View style={[s.photo, { height: 190, borderRadius: 0 }]}>
          <T gras gris style={{ letterSpacing: 1 }}>{e.port.toUpperCase()}</T>
          <SafeAreaView edges={['top']} style={{ position: 'absolute', left: 14, right: 14, top: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Rond blanc label="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(client)'))}><T tresGras style={{ fontSize: 20 }}>‹</T></Rond>
          </SafeAreaView>
        </View>
        <View style={{ padding: 16, gap: 8 }}>
          <T tresGras style={{ fontSize: 26 }}>Étal de {e.pecheur}</T>
          <T gris>{String(e.note).replace('.', ',')} ★ ({e.avis} avis) · {e.port} · {app.km(e)} km</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Pastille texte={'Arrivé ' + heure(e.debarque) + ' · ' + app.depuis(e)} fonce={!app.frais(e)} />
            <Pastille texte={'Retrait jusqu’à ' + heure(e.limiteRetrait)} style={{ backgroundColor: c.doux }} />
            <Pastille texte={e.bateau} style={{ backgroundColor: c.doux }} />
          </View>
        </View>
        {autre ? (
          <View style={{ marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: c.accentPale, gap: 8 }}>
            <T>Votre panier contient déjà l’étal de <T tresGras>{app.etal(app.e.panier!.etalId)?.pecheur}</T>. Un panier = un seul vendeur.</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip titre="Vider le panier" actif onPress={app.viderPanier} />
              <Chip titre="Voir mon panier" onPress={() => router.push('/panier')} />
            </View>
          </View>
        ) : null}
        {e.produits.map((p) => {
          const q = app.kgPanier(e.id, p.id), dispo = p.dispoKg > 0;
          const prep = estPese(p.unite) ? 'Au kilo, pesé au retrait' : 'Vendu ' + (p.unite === 'pièce' ? 'à la pièce' : 'au ' + p.unite) + (p.detail ? ' · ' + p.detail : '');
          return (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.ligne, opacity: dispo ? 1 : 0.5 }}>
              <View style={{ flex: 1, gap: 3 }}>
                <T tresGras style={{ fontSize: 16 }}>{p.espece}</T>
                <T gris petit>{prep}</T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <Pastille texte={'Origine : ' + p.origine} style={{ backgroundColor: p.origine === 'Péyi' ? '#dff3ea' : c.doux }} />
                  {p.solAnalyse ? <Pastille texte="Sol analysé" fonce /> : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Prix texte={euro(p.prixKg) + parUnite(p.unite)} />
                  <T petit style={{ color: !dispo || p.dispoKg <= 4 ? c.alerte : c.vert }}>{!dispo ? 'épuisé' : p.dispoKg <= 4 ? 'plus que ' + qte(p.dispoKg, p.unite) : qte(p.dispoKg, p.unite) + ' dispo'}</T>
                </View>
              </View>
              {!dispo || autre ? null : q ? (
                <Stepper valeur={qte(q, p.unite)} onMoins={() => pas(p.id, -1)} onPlus={() => pas(p.id, 1)} onValeur={estPese(p.unite) ? () => setReglage({ produitId: p.id, kg: q }) : undefined} />
              ) : (
                <Pressable accessibilityLabel={'Ajouter ' + p.espece} onPress={() => pas(p.id, 1)} style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: c.marine, alignItems: 'center', justifyContent: 'center' }}>
                  <T tresGras style={{ color: '#fff', fontSize: 20 }}>+</T>
                </Pressable>
              )}
            </View>
          );
        })}
        <View style={{ flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: c.ligne }}>
          <IcVerrou couleur={c.gris} taille={18} />
          <T gris petit style={{ flex: 1 }}>L’adresse exacte et la messagerie avec {e.pecheur} s’ouvrent après la réservation.</T>
        </View>
      </ScrollView>
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: c.ligne }}>
        <Bouton titre="Voir mon panier" desactive={!nb} onPress={() => router.push('/panier')}
          gauche={<View style={{ backgroundColor: c.accent, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 }}><T tresGras petit>{nb}</T></View>}
          droite={<T tresGras style={{ color: '#fff' }}>env. {euro(nb ? sousTotal(app.e.panier!.lignes) : 0)}</T>} />
      </View>

      <Feuille visible={!!reglage && !!prodReglage} onFermer={() => setReglage(null)} titre={prodReglage?.espece ?? ''}>
        {reglage && prodReglage ? (
          <View style={{ gap: 14 }}>
            <T gris>{euro(prodReglage.prixKg)}/kg · {kg(prodReglage.dispoKg)} disponibles · vous payez le poids réel pesé</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              <Pressable onPress={() => setReglage({ ...reglage, kg: Math.max(0, Math.round((reglage.kg - 0.1) * 10) / 10) })} style={{ width: 76, height: 56, borderRadius: 16, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center' }}><T tresGras>−100 g</T></Pressable>
              <View style={{ alignItems: 'center', minWidth: 120 }}>
                <T tresGras style={{ fontSize: 40 }}>{kg(reglage.kg)}</T>
                <T gras gris>≈ {euro(reglage.kg * prodReglage.prixKg)}</T>
              </View>
              <Pressable onPress={() => setReglage({ ...reglage, kg: Math.min(prodReglage.dispoKg, Math.round((reglage.kg + 0.1) * 10) / 10) })} style={{ width: 76, height: 56, borderRadius: 16, backgroundColor: c.doux, alignItems: 'center', justifyContent: 'center' }}><T tresGras>+100 g</T></Pressable>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {(pro ? [1, 2, 5, 10, 20] : [0.5, 1, 1.5, 2, 3, 5]).filter((x) => x <= prodReglage.dispoKg).map((x) => <Chip key={x} titre={x < 1 ? '500 g' : kg(x)} actif={Math.abs(reglage.kg - x) < 0.01} onPress={() => setReglage({ ...reglage, kg: x })} />)}
            </View>
            <Bouton titre={reglage.kg > 0 ? 'Valider ' + kg(reglage.kg) : 'Retirer du panier'} onPress={() => { app.reglerKg(e.id, reglage.produitId, reglage.kg); setReglage(null); }} />
          </View>
        ) : null}
      </Feuille>
    </SafeAreaView>
  );
}
