import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProfileCreationResult, ProfilePatch, ProfileRow, RegisterPayload } from '~/types/auth'
import { mapProfileError } from '~/utils/errors'

const PROFILE_TABLE = 'users'

/**
 * Lecture / écriture de la ligne de profil `public.users`.
 *
 * Les préférences alimentaires (`user_dietary_tags`, `taste_preferences`) sont
 * gérées à part par `useDietaryPreferences()`.
 *
 * @param client Client Supabase optionnel — utilisé au démarrage par
 *   `plugins/supabase.client.ts`, avant que `$supabase` ne soit injecté.
 */
export function useProfile(client?: SupabaseClient) {
  const supabase = client ?? useSupabase()

  /**
   * Crée le profil après un `signUp` réussi :
   *  - ligne `public.users` (critique — lève une erreur si échec)
   *  - tags régime / allergène + goûts (annexes — échec non bloquant, listé
   *    dans `failedExtras`).
   * `upsert` sur `id` : idempotent en cas de nouvelle tentative.
   */
  async function insertProfile(userId: string, payload: RegisterPayload): Promise<ProfileCreationResult> {
    const extras = payload.extras

    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .upsert(
        {
          id: userId,
          email: payload.email.trim().toLowerCase(),
          first_name: payload.name.trim(),
          sport: payload.sport,
          level: extras?.level ?? null,
          objectif: extras?.objectif ?? null,
          frequence: payload.frequency,
          age: extras?.age ?? null,
          sexe: extras?.sexe ?? null,
          poids_kg: extras?.poidsKg ?? null,
          taille_cm: extras?.tailleCm ?? null,
        },
        { onConflict: 'id' },
      )
      .select()
      .single()

    if (error) throw new Error(mapProfileError(error))
    const profile = data as ProfileRow

    const failedExtras: string[] = []
    if (extras) {
      const { insertDietaryTags, insertTastePreferences } = useDietaryPreferences(client)
      if (!(await insertDietaryTags(userId, extras.dietaryTagIds))) {
        failedExtras.push('ton régime alimentaire et tes allergies')
      }
      if (!(await insertTastePreferences(userId, extras))) {
        failedExtras.push('tes goûts (ingrédients aimés / à éviter)')
      }
    }

    return { profile, failedExtras }
  }

  /** Lit la ligne de profil du compte connecté. `null` si elle n'existe pas. */
  async function fetchProfile(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw new Error(mapProfileError(error))
    return (data as ProfileRow | null) ?? null
  }

  /** Met à jour partiellement la ligne de profil (champs modifiés uniquement). */
  async function updateProfile(userId: string, patch: ProfilePatch): Promise<ProfileRow> {
    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .update(patch)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(mapProfileError(error))
    return data as ProfileRow
  }

  return { insertProfile, fetchProfile, updateProfile }
}
