import type { FavoriteRecipe, RecipeRow } from '~/types/recipe'
import { mapDbError } from '~/utils/errors'

/**
 * Accès à `public.favorites` (PK composite `user_id, recipe_id`).
 *
 * Accès aux données uniquement : le cache et l'état (3 états) vivent dans
 * `stores/favorites.ts`, qui appelle ces fonctions avec l'id de l'utilisateur.
 */
export function useFavorites() {
  const supabase = useSupabase()

  /** Liste des recettes favorites de l'utilisateur (jointure favorites -> recipes). */
  async function fetchFavorites(userId: string): Promise<FavoriteRecipe[]> {
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
  async function addFavorite(userId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .upsert(
        { user_id: userId, recipe_id: recipeId },
        { onConflict: 'user_id,recipe_id', ignoreDuplicates: true },
      )

    if (error) throw new Error(mapDbError(error))
  }

  /** Retire une recette des favoris. */
  async function removeFavorite(userId: string, recipeId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)

    if (error) throw new Error(mapDbError(error))
  }

  return { fetchFavorites, addFavorite, removeFavorite }
}
