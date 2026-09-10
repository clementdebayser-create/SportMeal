/** Étapes du wizard d'inscription (`register.vue`). */

export const REGISTER_STEP_COUNT = 5

export const REGISTER_STEPS = [
  { title: 'Compte', hint: 'Crée ton compte et indique ta pratique sportive.' },
  { title: 'Données physiques', hint: 'Quelques infos optionnelles pour affiner tes portions plus tard.' },
  { title: 'Régime alimentaire', hint: 'Tes contraintes de régime, si tu en as.' },
  { title: 'Allergies', hint: 'Ce qui doit être exclu de tes suggestions.' },
  { title: 'Aversions', hint: 'Les ingrédients que tu préfères éviter.' },
] as const

/** Champs validés au passage de chaque étape (les étapes 3-5 sont facultatives). */
export const REGISTER_STEP_FIELDS: Record<number, readonly string[]> = {
  1: ['name', 'email', 'password', 'sport', 'frequency', 'level', 'objectif'],
  2: ['age', 'poids', 'taille'],
  3: [],
  4: [],
  5: [],
}
