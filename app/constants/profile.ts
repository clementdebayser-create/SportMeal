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

/** Niveau de pratique (colonne `users.level`). */
export const LEVELS = ['Débutant', 'Intermédiaire', 'Confirmé', 'Avancé'] as const

/** Sexe (colonne `users.sexe`) — champ optionnel. */
export const SEXES = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
  { value: 'autre', label: 'Autre' },
] as const

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
