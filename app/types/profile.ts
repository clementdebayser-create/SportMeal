import type { SPORTS, TRAINING_FREQUENCIES } from '~/constants/profile'

export type Sport = typeof SPORTS[number]
export type TrainingFrequency = typeof TRAINING_FREQUENCIES[number]
