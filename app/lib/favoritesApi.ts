import type { SupabaseClient } from '@supabase/supabase-js'
import type { FavoriteRecipe, RecipeRow } from '~/types/recipe'
import { mapDbError } from '~/lib/dbError'

/**
 * Table `public.favorites` (PK composite `user_id, recipe_id`).
 * Le client est injecté par le store : module sans contexte Nuxt.
 */

/** Liste des recettes favorites de l'utilisateur (jointure favorites -> recipes). */
export async function fetchFavorites(supabase: SupabaseClient, userId: string): Promise<FavoriteRecipe[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('created_at, recipes(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(mapDbError(error))

  return (data ?? []).flatMap((row) => {
    // PostgREST renvoie la ressource liée en objet (to-one) ; les types la
    // voient parfois en tableau selon la version -> on couvre les deux.
    const raw = (row as Record<string, unknown>).recipes
    const recipe = (Array.isArray(raw) ? raw[0] : raw) as RecipeRow | null | undefined
    return recipe
      ? [{ ...recipe, favoritedAt: (row as Record<string, unknown>).created_at as string }]
      : []
  })
}

/** Enregistre une recette. `on conflict do nothing` : aucune erreur si déjà enregistrée. */
export async function addFavorite(supabase: SupabaseClient, userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .upsert(
      { user_id: userId, recipe_id: recipeId },
      { onConflict: 'user_id,recipe_id', ignoreDuplicates: true },
    )

  if (error) throw new Error(mapDbError(error))
}

/** Retire une recette des favoris. */
export async function removeFavorite(supabase: SupabaseClient, userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)

  if (error) throw new Error(mapDbError(error))
}
