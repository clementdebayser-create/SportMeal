import type { ValidationRule } from '~/types/forms'

/** Fonctions pures composables pour la validation de formulaires. */

export function required(message = 'Ce champ est requis.'): ValidationRule {
  return value => (value.trim() ? undefined : message)
}

export function email(message = 'Adresse e-mail invalide.'): ValidationRule {
  return value => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : message)
}

export function minLength(length: number, message?: string): ValidationRule {
  return value => (value.length >= length ? undefined : message ?? `${length} caractères minimum.`)
}
