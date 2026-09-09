import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import type { ProfileRow, RegisterPayload } from '~/types/auth'

/**
 * Accès à la table de profil `public.users`.
 * Créée explicitement par l'app après un `signUp` réussi (pas de trigger DB).
 */

const PROFILE_TABLE = 'users'

export function mapProfileError(error: PostgrestError | { message: string, code?: string }): string {
  const code = 'code' in error ? error.code : undefined
  const m = (error.message || '').toLowerCase()

  if (code === '23505') return 'Un profil existe déjà pour ce compte.'
  if (code === '23503') return 'Aucun compte ne correspond à ce profil.'
  if (code === '42501' || m.includes('row-level security'))
    return 'Enregistrement du profil refusé (droits insuffisants). Contacte le support.'
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed'))
    return 'Problème de connexion. Vérifie ton réseau et réessaie.'
  return error.message || 'Erreur lors de l’accès au profil.'
}

/**
 * Insère (ou ré-insère) la ligne de profil avec le même `id` que le compte Auth.
 * `upsert` rend l'opération idempotente : une nouvelle tentative après échec
 * partiel ne provoque pas de doublon.
 */
export async function insertProfile(
  supabase: SupabaseClient,
  userId: string,
  payload: RegisterPayload,
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .upsert(
      {
        id: userId,
        email: payload.email.trim().toLowerCase(),
        first_name: payload.name.trim(),
        sport: payload.sport,
        level: null,
        objectif: null,
        frequence: payload.frequency,
      },
      { onConflict: 'id' },
    )
    .select()
    .single()

  if (error) throw new Error(mapProfileError(error))
  return data as ProfileRow
}

/** Lit la ligne de profil du compte connecté. `null` si elle n'existe pas. */
export async function fetchProfile(supabase: SupabaseClient, userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(mapProfileError(error))
  return (data as ProfileRow | null) ?? null
}
