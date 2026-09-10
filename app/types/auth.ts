import type { Tables } from '~/types/database.types'
import type { Sport, TrainingFrequency } from '~/types/profile'
import type { LoadStatus } from '~/types/status'

/** Identité issue de Supabase Auth (session). Distincte du profil `public.users`. */
export interface AuthIdentity {
  id: string
  email: string
}

export interface Credentials {
  email: string
  password: string
}

/**
 * Infos optionnelles collectées lors de l'inscription, au-delà du profil de base.
 * `null` / tableau vide = non renseigné.
 */
export interface RegisterExtras {
  /** Niveau de pratique (`users.level`). */
  level: string | null
  /** Objectif sportif (`users.objectif`). */
  objectif: string | null
  age: number | null
  sexe: string | null
  poidsKg: number | null
  tailleCm: number | null
  /** Ids de tags des catégories `regime` + `allergene`. */
  dietaryTagIds: string[]
  likedIngredientIds: string[]
  dislikedIngredientIds: string[]
}

export interface RegisterPayload extends Credentials {
  name: string
  sport: Sport
  frequency: TrainingFrequency
  extras?: RegisterExtras
}

/**
 * Résultat de la création de profil.
 * `failedExtras` liste les insertions annexes (régime, goûts) qui ont échoué
 * alors que le compte + le profil de base ont bien été créés.
 */
export interface ProfileCreationResult {
  profile: ProfileRow
  failedExtras: string[]
}

/** Cycle de vie du chargement du profil : trois états distincts + l'état initial. */
export type ProfileStatus = LoadStatus

/** Ligne de la table de profil `public.users` (dérivée du schéma Supabase généré). */
export type ProfileRow = Tables<'users'>

/** Champs de `public.users` modifiables depuis « Modifier le profil ». */
export type ProfilePatch = Partial<
  Pick<
    ProfileRow,
    'first_name' | 'email' | 'sport' | 'level' | 'objectif' | 'frequence'
    | 'age' | 'sexe' | 'poids_kg' | 'taille_cm'
  >
>
