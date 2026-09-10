import type { RecipeWithTags } from '~/types/recipe'
import { mapDbError } from '~/utils/errors'

/**
 * Accès aux recettes de « Mon repas du soir ».
 *
 * Le catalogue est petit : on charge les recettes taguées `soir` (+ leurs tags
 * et ingrédients) puis le filtrage fin se fait en mémoire
 * (`utils/recipeFilters.ts`). Le cache et l'état vivent dans `stores/recipes.ts`.
 */
export function useRecipes() {
  const supabase = useSupabase()

  /** Recettes du soir avec la liste de leurs tags et des ids de leurs ingrédients. */
  async function fetchSoirRecipes(): Promise<RecipeWithTags[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*, recipe_tags(tags(name)), recipe_ingredients(ingredient_id)')
      .order('title', { ascending: true })

    if (error) throw new Error(mapDbError(error))

    return (data ?? []).flatMap((row) => {
      const { recipe_tags: tagLinks, recipe_ingredients: ingLinks, ...recipe } = row as Record<string, unknown>

      const tags = (Array.isArray(tagLinks) ? tagLinks : []).flatMap((link) => {
        const raw = (link as Record<string, unknown>).tags
        const tag = (Array.isArray(raw) ? raw[0] : raw) as { name?: string } | null | undefined
        return tag?.name ? [tag.name] : []
      })

      const ingredientIds = (Array.isArray(ingLinks) ? ingLinks : []).flatMap((link) => {
        const id = (link as Record<string, unknown>).ingredient_id
        return typeof id === 'string' ? [id] : []
      })

      return tags.includes('soir')
        ? [{ ...(recipe as unknown as RecipeWithTags), tags, ingredientIds }]
        : []
    })
  }

  return { fetchSoirRecipes }
}
