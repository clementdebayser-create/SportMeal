import type { Sport, TrainingFrequency } from '~/types/profile'

/** Utilisateur tel qu'exposé à l'app (jamais le mot de passe). */
export interface AuthUser {
  name: string
  email: string
  sport?: Sport
  frequency?: TrainingFrequency
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
