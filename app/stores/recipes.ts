import { defineStore } from 'pinia'
import type { RecipeRow, RecipeSearchFilters, RecipeWithTags } from '~/types/recipe'
import type { LoadStatus } from '~/types/status'
import { fetchSoirRecipes } from '~/lib/recipesApi'

/**
 * « Mon repas du soir » : recherche filtrée.
 *
 * `all` cache les recettes du soir (+ tags) ; `results` est la liste filtrée
 * par la dernière recherche. `status` = 3 états + idle. `searched` distingue
 * « pas encore cherché » de « cherché, 0 résultat » (message convivial, pas
 * une erreur).
 */
export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    all: [] as RecipeWithTags[],
    results: [] as RecipeRow[],
    status: 'idle' as LoadStatus,
    error: null as string | null,
    searched: false,
  }),

  actions: {
    async search(filters: RecipeSearchFilters) {
      this.status = 'loading'
      this.error = null
      try {
        if (!this.all.length) {
          this.all = await fetchSoirRecipes(useSupabase())
        }

        this.results = this.all.filter((recipe) => {
          if (filters.mealType && !recipe.tags.includes(filters.mealType)) return false
          if (filters.objective && !recipe.tags.includes(filters.objective)) return false
          if (filters.maxMinutes != null) {
            const total = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0)
            if (total > filters.maxMinutes) return false
          }
          return true
        })

        this.searched = true
        this.status = 'ready'
      }
      catch (error) {
        this.status = 'error'
        this.error = error instanceof Error ? error.message : 'Impossible de charger les recettes.'
      }
    },
  },
})
