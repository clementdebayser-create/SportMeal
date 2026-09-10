import { OBJECTIVES } from '~/constants/profile'

/** Libellé lisible d'un objectif (`users.objectif`). `'—'` si absent / inconnu. */
export function objectifLabel(value: string | null | undefined): string {
  return OBJECTIVES.find(o => o.value === value)?.label ?? '—'
}

/**
 * Concatène des libellés de tags pour l'affichage.
 * `undefined` (non chargé) → `'—'` ; tableau vide → `'Aucun'`.
 */
export function joinLabels(items: { label: string }[] | undefined): string {
  if (!items) return '—'
  return items.length ? items.map(i => i.label).join(', ') : 'Aucun'
}

/** Idem `joinLabels` mais pour des objets `{ name }` (ingrédients). */
export function joinNames(items: { name: string }[] | undefined): string {
  if (!items) return '—'
  return items.length ? items.map(i => i.name).join(', ') : 'Aucun'
}
