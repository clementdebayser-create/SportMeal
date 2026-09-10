import { reactive, ref } from 'vue'
import type { RecipeRow } from '~/types/recipe'

/**
 * Enregistrement d'une recette en favori, avec un état (libellé, erreur)
 * individuel par recette pour la liste de résultats.
 */
export function useRecipeSave() {
  const favorites = useFavoritesStore()

  const savingId = ref<string | null>(null)
  const saveErrors = reactive<Record<string, string>>({})

  function saveLabel(recipeId: string) {
    if (favorites.isSaved(recipeId)) return 'Enregistré ✓'
    return savingId.value === recipeId ? 'Enregistrement…' : 'Enregistrer ce repas'
  }

  async function onSave(recipe: RecipeRow) {
    savingId.value = recipe.id
    delete saveErrors[recipe.id]
    try {
      await favorites.add(recipe)
    }
    catch (error) {
      saveErrors[recipe.id] = error instanceof Error ? error.message : 'Enregistrement impossible.'
    }
    finally {
      savingId.value = null
    }
  }

  return { savingId, saveErrors, saveLabel, onSave }
}
