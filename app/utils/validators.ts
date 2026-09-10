import type { ValidationRule } from '~/types/forms'

/** Fonctions pures pour la validation de formulaires (aucune dépendance Vue / Supabase). */

export function required(message = 'Ce champ est requis.'): ValidationRule {
  return value => (value.trim() ? undefined : message)
}

export function email(message = 'Adresse e-mail invalide.'): ValidationRule {
  return value => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : message)
}

export function minLength(length: number, message?: string): ValidationRule {
  return value => (value.length >= length ? undefined : message ?? `${length} caractères minimum.`)
}

/**
 * Nombre optionnel : valide si vide (champ non requis), sinon vérifie que
 * c'est bien un nombre et, le cas échéant, qu'il est dans l'intervalle.
 */
export function optionalNumber(options: { min?: number, max?: number, message?: string } = {}): ValidationRule {
  return (value) => {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const n = Number(trimmed.replace(',', '.'))
    if (!Number.isFinite(n)) return options.message ?? 'Valeur numérique attendue.'
    if (options.min != null && n < options.min) return options.message ?? `Valeur trop petite (min. ${options.min}).`
    if (options.max != null && n > options.max) return options.message ?? `Valeur trop grande (max. ${options.max}).`
    return undefined
  }
}
