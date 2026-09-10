import type { SupabaseClient } from '@supabase/supabase-js'
import type { RegisterExtras } from '~/types/auth'
import type { IngredientOption, ProfileDietary, ProfileTastes, TagOption } from '~/types/dietary'
import { DIETARY_LABELS } from '~/constants/dietary'
import { mapProfileError } from '~/utils/errors'

/**
 * Lecture / écriture des préférences alimentaires de l'utilisateur :
 * `user_dietary_tags` (régime + allergènes) et `taste_preferences`
 * (goûts / aversions).
 *
 * Séparé de `useProfile()` (table `public.users`) : responsabilité distincte,
 * mais même contrat (`client` optionnel pour le boot du plugin Supabase).
 */
export function useDietaryPreferences(client?: SupabaseClient) {
  const supabase = client ?? useSupabase()

  /** Écrit les tags régime / allergène. Renvoie `true` si OK. */
  async function insertDietaryTags(userId: string, tagIds: string[]): Promise<boolean> {
    if (tagIds.length === 0) return true
    const rows = tagIds.map(tag_id => ({ user_id: userId, tag_id }))
    const { error } = await supabase
      .from('user_dietary_tags')
      .upsert(rows, { onConflict: 'user_id,tag_id', ignoreDuplicates: true })
    return !error
  }

  /** Écrit les goûts / aversions. Renvoie `true` si OK. */
  async function insertTastePreferences(userId: string, extras: RegisterExtras): Promise<boolean> {
    const rows = [
      ...extras.likedIngredientIds.map(ingredient_id => ({ user_id: userId, ingredient_id, preference_type: 'aime' })),
      ...extras.dislikedIngredientIds.map(ingredient_id => ({ user_id: userId, ingredient_id, preference_type: 'deteste' })),
    ]
    if (rows.length === 0) return true
    const { error } = await supabase
      .from('taste_preferences')
      .upsert(rows, { onConflict: 'user_id,ingredient_id', ignoreDuplicates: true })
    return !error
  }

  /** Tags régime / allergène de l'utilisateur (jointure `user_dietary_tags` -> `tags`). */
  async function fetchDietary(userId: string): Promise<ProfileDietary> {
    const { data, error } = await supabase
      .from('user_dietary_tags')
      .select('tags(id, name, category)')
      .eq('user_id', userId)

    if (error) throw new Error(mapProfileError(error))

    const regime: TagOption[] = []
    const allergene: TagOption[] = []
    for (const row of data ?? []) {
      const raw = (row as Record<string, unknown>).tags
      const tag = (Array.isArray(raw) ? raw[0] : raw) as { id: string, name: string, category: string | null } | null | undefined
      if (!tag) continue
      const option: TagOption = { id: tag.id, name: tag.name, label: DIETARY_LABELS[tag.name] ?? tag.name }
      if (tag.category === 'regime') regime.push(option)
      else if (tag.category === 'allergene') allergene.push(option)
    }
    return { regime, allergene }
  }

  /** Goûts / aversions de l'utilisateur (jointure `taste_preferences` -> `ingredients`). */
  async function fetchTastes(userId: string): Promise<ProfileTastes> {
    const { data, error } = await supabase
      .from('taste_preferences')
      .select('preference_type, ingredients(id, name)')
      .eq('user_id', userId)

    if (error) throw new Error(mapProfileError(error))

    const liked: IngredientOption[] = []
    const disliked: IngredientOption[] = []
    for (const row of data ?? []) {
      const raw = (row as Record<string, unknown>).ingredients
      const ingredient = (Array.isArray(raw) ? raw[0] : raw) as { id: string, name: string } | null | undefined
      if (!ingredient) continue
      const option: IngredientOption = { id: ingredient.id, name: ingredient.name }
      if ((row as Record<string, unknown>).preference_type === 'aime') liked.push(option)
      else disliked.push(option)
    }
    return { liked, disliked }
  }

  /** Aligne `user_dietary_tags` sur la liste cible d'ids (ajouts + retraits ciblés). */
  async function syncDietaryTags(userId: string, targetTagIds: string[]): Promise<void> {
    const { data, error } = await supabase
      .from('user_dietary_tags')
      .select('tag_id')
      .eq('user_id', userId)
    if (error) throw new Error(mapProfileError(error))

    const current = new Set((data ?? []).map(row => row.tag_id as string))
    const toAdd = targetTagIds.filter(id => !current.has(id))
    const toRemove = [...current].filter(id => !targetTagIds.includes(id))

    if (toAdd.length > 0) {
      const { error: addError } = await supabase
        .from('user_dietary_tags')
        .insert(toAdd.map(tag_id => ({ user_id: userId, tag_id })))
      if (addError) throw new Error(mapProfileError(addError))
    }
    if (toRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('user_dietary_tags')
        .delete()
        .eq('user_id', userId)
        .in('tag_id', toRemove)
      if (removeError) throw new Error(mapProfileError(removeError))
    }
  }

  /** Aligne les aversions (`preference_type = 'deteste'`) sur la liste cible d'ids. */
  async function syncDislikedIngredients(userId: string, targetIngredientIds: string[]): Promise<void> {
    const { data, error } = await supabase
      .from('taste_preferences')
      .select('ingredient_id')
      .eq('user_id', userId)
      .eq('preference_type', 'deteste')
    if (error) throw new Error(mapProfileError(error))

    const current = new Set((data ?? []).map(row => row.ingredient_id as string))
    const toAdd = targetIngredientIds.filter(id => !current.has(id))
    const toRemove = [...current].filter(id => !targetIngredientIds.includes(id))

    if (toAdd.length > 0) {
      const { error: addError } = await supabase
        .from('taste_preferences')
        .upsert(
          toAdd.map(ingredient_id => ({ user_id: userId, ingredient_id, preference_type: 'deteste' })),
          { onConflict: 'user_id,ingredient_id' },
        )
      if (addError) throw new Error(mapProfileError(addError))
    }
    if (toRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('taste_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('preference_type', 'deteste')
        .in('ingredient_id', toRemove)
      if (removeError) throw new Error(mapProfileError(removeError))
    }
  }

  return {
    insertDietaryTags,
    insertTastePreferences,
    fetchDietary,
    fetchTastes,
    syncDietaryTags,
    syncDislikedIngredients,
  }
}
