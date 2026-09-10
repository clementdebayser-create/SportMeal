import type { Tables } from '~/types/database.types'

/** Ligne de `public.recipes` (dérivée du schéma Supabase généré). */
export type RecipeRow = Tables<'recipes'>

/** Une recette + la date à laquelle elle a été enregistrée en favori. */
export interface FavoriteRecipe extends RecipeRow {
  favoritedAt: string
}

/**
 * Une recette + les noms de ses tags (soir, viande, prise_de_masse, gluten,
 * vegan, …) et les ids de ses ingrédients (pour le filtrage par aversions).
 */
export interface RecipeWithTags extends RecipeRow {
  tags: string[]
  ingredientIds: string[]
}

/** Filtres choisis sur « Mon repas du soir ». `null` = pas de contrainte sur ce critère. */
export interface RecipeSearchFilters {
  mealType: string | null
  objective: string | null
  maxMinutes: number | null
}

/**
 * Contraintes issues du profil, appliquées automatiquement aux suggestions
 * quand l'utilisateur est connecté. Toutes les listes sont des exclusions
 * (sauf `regimes`, interprété comme des règles de compatibilité).
 */
export interface ProfileMealPrefs {
  /** Noms de tags allergènes du profil (`gluten`, `lactose`, …) → recette exclue si taguée ainsi. */
  allergenes: string[]
  /** Noms de tags régime du profil (`vegan`, `pescetarien`, …). */
  regimes: string[]
  /** Ids d'ingrédients marqués « à éviter » → recette exclue si elle en contient un. */
  dislikedIngredientIds: string[]
}
