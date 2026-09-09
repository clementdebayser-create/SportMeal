import type { PostgrestError } from '@supabase/supabase-js'

/** Traduit une erreur Postgrest / réseau en message français court et affichable. */
export function mapDbError(error: PostgrestError | { message: string, code?: string }): string {
  const code = 'code' in error ? error.code : undefined
  const m = (error.message || '').toLowerCase()

  if (code === '42501' || m.includes('row-level security'))
    return 'Action refusée (droits insuffisants). Contacte le support.'
  if (code === '23503')
    return 'Élément lié introuvable.'
  if (code === '23505')
    return 'Cet élément est déjà enregistré.'
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed'))
    return 'Problème de connexion. Vérifie ton réseau et réessaie.'

  return error.message || 'Une erreur est survenue.'
}
