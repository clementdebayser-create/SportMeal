/**
 * Référentiels du profil sportif, partagés entre le formulaire d'inscription,
 * l'affichage du compte et (à terme) le moteur de recommandation de recettes.
 */

export const SPORTS = [
  'Course à pied',
  'Musculation',
  'Cyclisme',
  'Natation',
  'Football',
  'Tennis',
  'Yoga / Pilates',
  'CrossFit',
  'Randonnée',
  'Autre',
] as const

export const TRAINING_FREQUENCIES = ['1–2×', '3–4×', '5–6×', '7×+'] as const

/**
 * Objectifs sportifs — valeurs partagées entre le profil utilisateur
 * (colonne `objectif`) et les filtres de « Mon repas du soir » (tags `objectif`).
 */
export const OBJECTIVES = [
  { value: 'perte_de_poids', label: 'Perte de poids' },
  { value: 'prise_de_masse', label: 'Prise de masse' },
  { value: 'maintien', label: 'Maintien' },
  { value: 'endurance', label: 'Endurance' },
] as const
