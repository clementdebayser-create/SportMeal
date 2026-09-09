import { defineStore } from 'pinia'
import type { FavoriteRecipe, RecipeRow } from '~/types/recipe'
import type { LoadStatus } from '~/types/status'
import { addFavorite, fetchFavorites, removeFavorite } from '~/lib/favoritesApi'

/**
 * Repas enregistrés de l'utilisateur connecté.
 *
 * `status` : 3 états explicites (idle | loading | ready | error), comme le
 * profil sur /account. Les mises à jour add/remove sont optimistes avec
 * rollback en cas d'échec ; les erreurs d'action sont levées pour être
 * affichées près du bouton concerné (pas d'échec silencieux).
 */
export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    items: [] as FavoriteRecipe[],
    status: 'idle' as LoadStatus,
    error: null as string | null,
  }),

  getters: {
    savedIds: state => new Set(state.items.map(r => r.id)),
    isSaved(): (recipeId: string) => boolean {
      return recipeId => this.savedIds.has(recipeId)
    },
  },

  actions: {
    async load() {
      const auth = useAuthStore()
      if (!auth.user) {
        this.reset()
        return
      }
      const supabase = useSupabase()
      const requestedFor = auth.user.id

      this.status = 'loading'
      this.error = null
      try {
        const items = await fetchFavorites(supabase, requestedFor)
        if (useAuthStore().user?.id !== requestedFor) return
        this.items = items
        this.status = 'ready'
      }
      catch (error) {
        if (useAuthStore().user?.id !== requestedFor) return
        this.status = 'error'
        this.error = error instanceof Error ? error.message : 'Impossible de charger tes repas enregistrés.'
      }
    },

    retry() {
      return this.load()
    },

    /** Enregistre la recette affichée. Lève une erreur en cas d'échec. */
    async add(recipe: RecipeRow) {
      const auth = useAuthStore()
      if (!auth.user) throw new Error('Connecte-toi pour enregistrer ce repas.')

      await addFavorite(useSupabase(), auth.user.id, recipe.id)

      if (!this.savedIds.has(recipe.id)) {
        this.items = [{ ...recipe, favoritedAt: new Date().toISOString() }, ...this.items]
      }
    },

    /** Retire une recette (optimiste + rollback). Lève une erreur en cas d'échec. */
    async remove(recipeId: string) {
      const auth = useAuthStore()
      if (!auth.user) return

      const snapshot = [...this.items]
      this.items = this.items.filter(r => r.id !== recipeId)
      try {
        await removeFavorite(useSupabase(), auth.user.id, recipeId)
      }
      catch (error) {
        this.items = snapshot
        throw error instanceof Error ? error : new Error('Impossible de retirer ce repas.')
      }
    },

    reset() {
      this.items = []
      this.status = 'idle'
      this.error = null
    },
  },
})
