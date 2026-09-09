/** Filtres de la page « Mon repas du soir » (basés sur les tags des recettes). */

/** Correspond aux tags de catégorie `type_plat`. */
export const MEAL_TYPES = [
  { value: 'viande', label: 'Viande' },
  { value: 'poisson', label: 'Poisson' },
  { value: 'vegetarien', label: 'Végétarien' },
] as const

/**
 * Paliers de temps de préparation total (prep_time + cook_time).
 * La valeur est le plafond en minutes (`''` = « Peu importe », pas de filtre).
 */
export const PREP_TIME_LIMITS = [
  { value: '30', label: '30 min ou moins' },
  { value: '45', label: '45 min ou moins' },
] as const
