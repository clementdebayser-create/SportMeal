import { defineStore } from 'pinia'
import type { RecipeSearchFilters, RecipeWithTags } from '~/types/recipe'
import type { LoadStatus } from '~/types/status'
import { filterByProfile, filterDinnerRecipes } from '~/utils/recipeFilters'

/**
 * « Mon repas du soir » : état de la recherche filtrée (état partagé + cache).
 *
 * `all` cache les recettes du soir (+ tags + ingrédients) ; `results` est la
 * liste après filtrage par la dernière recherche ET par le profil (allergies,
 * régime, aversions) quand l'utilisateur est connecté. Le fetch et le filtrage
 * sont délégués à `useRecipes()`. `searched` distingue « pas encore cherché »
 * de « 0 résultat ».
 */
export const useRecipesStore = defineStore('recipes', {
  state: () => ({
    all: [] as RecipeWithTags[],
    results: [] as RecipeWithTags[],
    status: 'idle' as LoadStatus,
    error: null as string | null,
    searched: false,
    /** Derniers filtres manuels, conservés pour re-filtrer sans refetch. */
    lastFilters: null as RecipeSearchFilters | null,
    /** L'utilisateur a demandé à voir les recettes malgré son profil. */
    ignoreProfile: false,
    /** Nombre de recettes retirées par le filtre de profil lors du dernier filtrage. */
    hiddenByProfile: 0,
  }),

  actions: {
    async search(filters: RecipeSearchFilters) {
      const { fetchSoirRecipes } = useRecipes()
      this.status = 'loading'
      this.error = null
      this.lastFilters = filters
      this.ignoreProfile = false
      try {
        if (!this.all.length) {
          this.all = await fetchSoirRecipes()
        }
        this.applyFilters()
        this.searched = true
        this.status = 'ready'
      }
      catch (error) {
        this.status = 'error'
        this.error = error instanceof Error ? error.message : 'Impossible de charger les recettes.'
      }
    },

    /**
     * (Re)calcule `results` à partir du cache : filtres manuels puis, sauf si
     * `ignoreProfile`, contraintes du profil connecté.
     */
    applyFilters() {
      if (!this.lastFilters) return
      const auth = useAuthStore()

      const manual = filterDinnerRecipes(this.all, this.lastFilters)

      const usesProfile = !this.ignoreProfile && auth.isAuthenticated
      if (usesProfile) {
        const filtered = filterByProfile(manual, {
          allergenes: auth.profileDietary?.allergene.map(t => t.name) ?? [],
          regimes: auth.profileDietary?.regime.map(t => t.name) ?? [],
          dislikedIngredientIds: auth.profileTastes?.disliked.map(i => i.id) ?? [],
        })
        this.results = filtered
        this.hiddenByProfile = manual.length - filtered.length
      }
      else {
        this.results = manual
        this.hiddenByProfile = 0
      }
    },

    /** Affiche les recettes en ignorant les contraintes du profil. */
    showAllIgnoringProfile() {
      this.ignoreProfile = true
      this.applyFilters()
    },

    /** Réactive le filtrage par le profil. */
    restoreProfileFilter() {
      this.ignoreProfile = false
      this.applyFilters()
    },
  },
})
