import type { ProfileMealPrefs, RecipeSearchFilters, RecipeWithTags } from '~/types/recipe'

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
