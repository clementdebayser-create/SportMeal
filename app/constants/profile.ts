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
