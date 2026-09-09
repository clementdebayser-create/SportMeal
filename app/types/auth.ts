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

export interface RegisterPayload extends Credentials {
  name: string
  sport: Sport
  frequency: TrainingFrequency
}

/** Cycle de vie du chargement du profil : trois états distincts + l'état initial. */
export type ProfileStatus = LoadStatus

/** Ligne de la table de profil `public.users` (liée à `auth.users` par `id`). */
export interface ProfileRow {
  id: string
  email: string | null
  first_name: string | null
  sport: string | null
  level: string | null
  objectif: string | null
  frequence: string | null
  created_at: string
}
