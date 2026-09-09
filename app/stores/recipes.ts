import { defineStore } from 'pinia'
import type { RecipeRow } from '~/types/recipe'
import type { LoadStatus } from '~/types/status'
import { fetchAllRecipes } from '~/lib/recipesApi'

function pickRandom(list: RecipeRow[], excludeId?: string): RecipeRow {
  const pool = list.length > 1 && excludeId ? list.filter(r => r.id !== excludeId) : list
  return pool[Math.floor(Math.random() * pool.length)]!
}

/**
 * « Mon repas du soir » : propose une recette tirée de `public.recipes`.
 * `status` suit le chargement du catalogue (3 états + idle) ; `current` est
 * la recette actuellement affichée.
 */
export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    pool: [] as RecipeRow[],
    current: null as RecipeRow | null,
    status: 'idle' as LoadStatus,
    error: null as string | null,
  }),

  actions: {
    async suggest() {
      this.status = 'loading'
      this.error = null
      try {
        if (!this.pool.length) {
          this.pool = await fetchAllRecipes(useSupabase())
        }
        if (!this.pool.length) {
          this.current = null
          this.status = 'error'
          this.error = 'Aucune recette disponible pour le moment.'
          return
        }
        this.current = pickRandom(this.pool, this.current?.id)
        this.status = 'ready'
      }
      catch (error) {
        this.status = 'error'
        this.error = error instanceof Error ? error.message : 'Impossible de charger une recette.'
      }
    },
  },
})
