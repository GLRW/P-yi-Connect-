import type { Etal, Origine, Unite } from '../types';

// Communes couvertes et coordonnées (carte et distances)
export const PORTS: Record<string, { lat: number; lon: number }> = {
  'Fort-de-France': { lat: 14.603, lon: -61.07 },
  'Le Lamentin': { lat: 14.613, lon: -61.0 },
  'Le Robert': { lat: 14.678, lon: -60.94 },
  'Le François': { lat: 14.616, lon: -60.903 },
  'Le Morne-Rouge': { lat: 14.775, lon: -61.135 },
  'Saint-Pierre': { lat: 14.743, lon: -61.176 },
  'Gros-Morne': { lat: 14.716, lon: -61.035 },
  'Ducos': { lat: 14.575, lon: -60.975 },
  'Rivière-Pilote': { lat: 14.484, lon: -60.902 },
  'Sainte-Anne': { lat: 14.44, lon: -60.882 },
};

export const FILTRES = ['Tout', 'Moins d’1 h', 'Fruits', 'Légumes', 'Racines', 'Herbes', 'Sol analysé'];
export const FAMILLES: Record<string, string> = {
  'Banane plantain': 'Fruits', 'Banane dessert': 'Fruits', 'Mangue': 'Fruits', 'Ananas': 'Fruits', 'Corossol': 'Fruits', 'Maracudja': 'Fruits', 'Goyave': 'Fruits', 'Avocat': 'Fruits', 'Citron vert': 'Fruits', 'Coco': 'Fruits',
  'Christophine': 'Légumes', 'Giraumon': 'Légumes', 'Concombre': 'Légumes', 'Tomate': 'Légumes', 'Piment végétarien': 'Légumes', 'Gombo': 'Légumes', 'Laitue': 'Légumes',
  'Igname': 'Racines', 'Dachine': 'Racines', 'Patate douce': 'Racines', 'Manioc': 'Racines', 'Fruit à pain': 'Racines',
  'Cive': 'Herbes', 'Persil': 'Herbes', 'Thym': 'Herbes', 'Bois d’Inde': 'Herbes',
};
export const famille = (produit: string) => FAMILLES[produit] ?? 'Autres';
export const ESPECES = Object.keys(FAMILLES);
export const produitCorrespond = (p: { espece: string; solAnalyse?: boolean }, filtre: string) => (filtre === 'Sol analysé' ? !!p.solAnalyse : famille(p.espece) === filtre);

const p = (id: string, espece: string, unite: Unite, prixKg: number, dispoKg: number, origine: Origine = 'Péyi', extra: { solAnalyse?: boolean; detail?: string } = {}) => ({
  id, espece, unite, prixKg, dispoKg, origine, preparations: [{ nom: 'Tel quel', supplementKg: 0 }], ...extra,
});

// Données d'exemple du mode démo (remplacées par Supabase en production)
export const ETALS_DEMO: Etal[] = [
  { id: 'ma', pecheur: 'Marcelle', type: 'Marchand ambulant', port: 'Le Robert', note: 4.8, avis: 41, bateau: 'Camionnette blanche · bord de route', debarque: 7 * 60 + 15, limiteRetrait: 13 * 60,
    lieu: 'Rond-point du Robert, côté station', precision: 'camionnette blanche, parasol vert',
    produits: [p('ma1', 'Banane plantain', 'régime', 12, 6, 'Péyi', { detail: 'environ 5 kg' }), p('ma2', 'Christophine', 'tas', 3, 10, 'Péyi', { detail: '4 pièces' }), p('ma3', 'Ananas', 'pièce', 3.5, 15), p('ma4', 'Cive', 'paquet', 1.5, 20)] },
  { id: 'jl', pecheur: 'Jean-Luc', type: 'Agriculteur', port: 'Le Morne-Rouge', note: 4.9, avis: 33, bateau: 'Exploitation Habitation Bel Air · 3 ha', debarque: 6 * 60 + 30, limiteRetrait: 12 * 60,
    lieu: 'Habitation Bel Air, Le Morne-Rouge', precision: 'hangar à l’entrée, cloche à sonner',
    produits: [p('jl1', 'Igname', 'kg', 4.5, 40, 'Péyi', { solAnalyse: true }), p('jl2', 'Dachine', 'kg', 4, 25, 'Péyi', { solAnalyse: true }), p('jl3', 'Giraumon', 'kg', 2.5, 30), p('jl4', 'Laitue', 'pièce', 1.5, 30)] },
  { id: 'sy', pecheur: 'Sylvie', type: 'Marchand ambulant', port: 'Le Lamentin', note: 4.6, avis: 27, bateau: 'Étal mobile · parking de la Galleria', debarque: 7 * 60 + 40, limiteRetrait: 12 * 60 + 30,
    lieu: 'Parking de la Galleria, Le Lamentin', precision: 'sous la tonnelle bleue',
    produits: [p('sy1', 'Mangue', 'tas', 4, 12, 'Péyi', { detail: '5 mangues Julie' }), p('sy2', 'Avocat', 'pièce', 1.5, 30), p('sy3', 'Citron vert', 'tas', 2, 15, 'Péyi', { detail: '10 citrons' }), p('sy4', 'Tomate', 'kg', 3.5, 10, 'Caraïbe')] },
  { id: 'ro', pecheur: 'Roland', type: 'Agriculteur', port: 'Gros-Morne', note: 4.7, avis: 19, bateau: 'Jardin créole · agriculture raisonnée', debarque: 6 * 60 + 45, limiteRetrait: 11 * 60 + 30,
    lieu: 'Quartier Morne Lacroix, Gros-Morne', precision: 'portail vert, maison jaune',
    produits: [p('ro1', 'Patate douce', 'kg', 3, 30, 'Péyi', { solAnalyse: true }), p('ro2', 'Manioc', 'kg', 2.5, 20, 'Péyi', { solAnalyse: true }), p('ro3', 'Gombo', 'tas', 2.5, 12), p('ro4', 'Piment végétarien', 'paquet', 2, 15)] },
  { id: 'jo', pecheur: 'Josiane', type: 'Marchand ambulant', port: 'Fort-de-France', note: 4.5, avis: 52, bateau: 'Marché couvert · étal 8', debarque: 6 * 60 + 15, limiteRetrait: 13 * 60,
    lieu: 'Grand marché couvert, Fort-de-France', precision: 'allée des épices, étal 8',
    produits: [p('jo1', 'Corossol', 'pièce', 6, 8), p('jo2', 'Maracudja', 'tas', 3, 10, 'Péyi', { detail: '6 fruits' }), p('jo3', 'Bois d’Inde', 'paquet', 1.5, 25), p('jo4', 'Thym', 'paquet', 1.5, 25)] },
  { id: 'gi', pecheur: 'Gilles', type: 'Agriculteur', port: 'Rivière-Pilote', note: 4.8, avis: 14, bateau: 'Ferme du Sud · bananes et fruits', debarque: 7 * 60 + 50, limiteRetrait: 12 * 60,
    lieu: 'Ferme du Sud, route de la Mauny', precision: 'cabane en bois au bord de la route',
    produits: [p('gi1', 'Banane dessert', 'kg', 2.5, 40), p('gi2', 'Fruit à pain', 'pièce', 3, 15), p('gi3', 'Coco', 'pièce', 2, 20), p('gi4', 'Concombre', 'kg', 2.5, 12)] },
  { id: 'li', pecheur: 'Lise', type: 'Marchand ambulant', port: 'Sainte-Anne', note: 4.7, avis: 23, bateau: 'Étal de bord de plage', debarque: 7 * 60 + 25, limiteRetrait: 13 * 60,
    lieu: 'Place du bourg, Sainte-Anne', precision: 'à côté de l’église, nappe madras',
    produits: [p('li1', 'Goyave', 'tas', 3, 10), p('li2', 'Ananas', 'pièce', 4, 12), p('li3', 'Mangue', 'kg', 4, 15)] },
];
