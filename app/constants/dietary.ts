/**
 * Libellés français lisibles pour les tags des catégories `regime` et
 * `allergene` (la table `tags` ne stocke que des noms techniques).
 */
export const DIETARY_LABELS: Record<string, string> = {
  // regime
  vegetarien: 'Végétarien',
  vegan: 'Végan',
  halal: 'Halal',
  casher: 'Casher',
  sans_porc: 'Sans porc',
  pescetarien: 'Pescétarien',
  // allergene
  gluten: 'Gluten',
  lactose: 'Lactose',
  arachides: 'Arachides',
  fruits_de_mer: 'Fruits de mer',
  oeufs: 'Œufs',
  soja: 'Soja',
  fruits_a_coque: 'Fruits à coque',
}
