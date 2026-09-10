import type { ProfileMealPrefs, RecipeSearchFilters, RecipeWithTags } from '~/types/recipe'
import { mapDbError } from '~/utils/errors'

/** Filtrage pur d'une liste de recettes selon les critères de « Mon repas du soir ». */
export function filterDinnerRecipes(
  recipes: RecipeWithTags[],
  filters: RecipeSearchFilters,
): RecipeWithTags[] {
  return recipes.filter((recipe) => {
    if (filters.mealType && !recipe.tags.includes(filters.mealType)) return false
    if (filters.objective && !recipe.tags.includes(filters.objective)) return false
    if (filters.maxMinutes != null) {
      const total = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
      if (total > filters.maxMinutes) return false
    }
    return true
  })
}

/**
 * Retire les recettes incompatibles avec le profil de l'utilisateur :
 *
 *  - **Allergènes** : les recettes sont taguées avec les allergènes qu'elles
 *    contiennent (`gluten`, `lactose`, …). Toute recette taguée avec un
 *    allergène du profil est exclue (promesse faite à l'inscription).
 *  - **Aversions** : exclusion de toute recette contenant un ingrédient marqué
 *    « à éviter ».
 *  - **Régime** :
 *      · `pescetarien` → pas de plat `viande` ;
 *      · `vegan` → uniquement les recettes taguées `vegan`, ou végétariennes
 *        sans tag `lactose` / `oeufs` ;
 *      · `halal` / `casher` / `sans_porc` → exclusion du porc (aucune recette
 *        du catalogue n'en contient aujourd'hui, donc sans effet visible).
 */
export function filterByProfile(
  recipes: RecipeWithTags[],
  prefs: ProfileMealPrefs,
): RecipeWithTags[] {
  const allergenes = new Set(prefs.allergenes)
  const disliked = new Set(prefs.dislikedIngredientIds)
  const regimes = new Set(prefs.regimes)

  return recipes.filter((recipe) => {
    if (recipe.tags.some(tag => allergenes.has(tag))) return false
    if (recipe.ingredientIds.some(id => disliked.has(id))) return false

    if (regimes.has('pescetarien') && recipe.tags.includes('viande')) return false

    if (regimes.has('vegan')) {
      const isVegan
        = recipe.tags.includes('vegan')
          || (recipe.tags.includes('vegetarien')
            && !recipe.tags.includes('lactose')
            && !recipe.tags.includes('oeufs'))
      if (!isVegan) return false
    }

    return true
  })
}

/**
 * Accès aux recettes + logique de recherche de « Mon repas du soir ».
 *
 * Le catalogue est petit : on charge les recettes taguées `soir` (+ leurs tags
 * et ingrédients) puis le filtrage fin se fait en mémoire. Le cache et l'état
 * vivent dans `stores/recipes.ts`.
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

  return { fetchSoirRecipes, filterDinnerRecipes, filterByProfile }
}
