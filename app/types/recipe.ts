/** Ligne de la table `public.recipes`. */
export interface RecipeRow {
  id: string
  title: string
  description: string | null
  image_url: string | null
  prep_time_minutes: number | null
  cook_time_minutes: number | null
  servings: number | null
  difficulty: string | null
  calories_kcal: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  created_at: string
}

/** Une recette + la date à laquelle elle a été enregistrée en favori. */
export interface FavoriteRecipe extends RecipeRow {
  favoritedAt: string
}

/** Une recette + les noms de ses tags (soir, viande, prise_de_masse, …). */
export interface RecipeWithTags extends RecipeRow {
  tags: string[]
}

/** Filtres choisis sur « Mon repas du soir ». `null` = pas de contrainte sur ce critère. */
export interface RecipeSearchFilters {
  mealType: string | null
  objective: string | null
  maxMinutes: number | null
}
