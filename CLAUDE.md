# Péyi Connect

Application mobile de vente directe de **fruits et légumes en Martinique** : les **agriculteurs** et les **marchands ambulants** publient leur étal du jour, les clients réservent, paient en ligne et récupèrent au bord de la route, au marché ou à l'exploitation. Projet frère de **Pêche Connect** (dépôt GLRW/P-che-Connect), construit à partir de son code.

Le porteur du projet n'est pas développeur : explique les choix simplement, en français, et avance par petites étapes testables.

## Identité (validée)

- **Nom** : Péyi Connect. **Phrase** : « Réservez. Payez. Récupérez. »
- **Même style que Pêche Connect** : logo « le panneau » (« PÉYI / CONNECT » en Bebas Neue, trait vertical, phrase en Figtree 800), Figtree pour l'interface, gris `#e5e5e2` pour les prix (provisoire).
- **Couleur : vert feuille `#1f5c3a`** (logo, boutons, sélections). Dans le code, la clé s'appelle encore `marine` (héritage de Pêche Connect).
- **Icône d'appli : « PÉYI » écrit en entier** sur carré vert (pas « PC », pour ne pas confondre avec Pêche Connect).
- Pas de photos pour l'instant (celles de Pêche Connect ne sont pas reprises).

## Spécificités fruits et légumes

- **Vendeurs** : `Agriculteur` (vend sa production : statut agricole, MSA, SIRET) ou `Marchand ambulant` (revendeur : entreprise déclarée, carte de commerçant ambulant hors de sa commune, autorisation de la mairie pour l'emplacement). Vérification à l'inscription (SIRET ou MSA). Les vendeurs non déclarés ne peuvent pas vendre (paiement en ligne = SIRET obligatoire).
- **Unités de vente** (`Unite`) : `kg` (pesé au retrait, empreinte bancaire +10 %) ou à prix fixe `tas`, `lot`, `pièce`, `régime`, `paquet` (pas de marge, pas de pesée). Fonctions dans `src/format.ts` : `qte`, `parUnite`, `estPese`, `montantBloqueLignes`.
- **Origine obligatoire** (`Péyi` / `Caraïbe` / `Importé`) affichée sur chaque produit ; fausse déclaration = suspension du compte.
- **« Sol analysé »** (chlordécone) pour les racines (igname, dachine, patate douce, manioc, fruit à pain) : badge et filtre.
- **Familles** (`src/data/demo.ts`) : Fruits, Légumes, Racines, Herbes ; filtres de l'accueil et de la carte.
- **Communes** au lieu des ports : Fort-de-France, Le Lamentin, Le Robert, Le François, Le Morne-Rouge, Saint-Pierre, Gros-Morne, Ducos, Rivière-Pilote, Sainte-Anne.
- Réglementation à vérifier (CCI, Chambre d'agriculture, DAAF, mairies) : affichage du prix et de l'origine, balance contrôlée pour la vente au poids, produits transformés (jus, découpés) soumis à déclaration DAAF.

## Code (`app/`)

- Expo / React Native, TypeScript, même organisation que Pêche Connect : écrans dans `app/app/`, « cerveau » dans `src/store.tsx` (mode démo, données sur le téléphone), données d'exemple dans `src/data/demo.ts` (7 vendeurs).
- Les noms de dossiers / fonctions hérités (`(pecheur)`, `pecheur`, `espece`, `prixKg`, `dispoKg`, `port`, `bateau`) sont gardés pour faciliter les reports entre les deux projets ; à l'écran : « vendeur », « produit », « commune », « exploitation / emplacement ».
- Client : accueil, carte, étal, panier, bon de retrait, mes bons, messages, chat (numéros masqués, position du vendeur). Vendeur : « Mon étal » (unité, origine, sol analysé, prix, quantités), réservations, pesée (seulement les produits au kilo), besoins pros, messages. Espace pro (restaurants, épiceries, cantines, revendeurs, traiteurs) et livraison par chauffeur repris de Pêche Connect.
- Vérifier : `cd app && npm install && npx tsc --noEmit`. Construire la version web : `EXPO_OFFLINE=1 npx expo export --platform web` (`baseUrl` `/P-yi-Connect-/app` dans app.json, pour GitHub Pages ; le dépôt doit être public pour Pages gratuit).

## À faire

- Mise en ligne (GitHub Pages, comme Pêche Connect) quand le porteur le souhaite.
- Comptes réels (Supabase), paiement (Stripe Connect), vrais SMS.
- Lots à composition libre (panier « légumes de la semaine »), abonnements, saisonnalité.
