import { ref } from 'vue'
import { DIETARY_LABELS } from '~/constants/dietary'
import { mapDbError } from '~/utils/errors'

/** Option prête pour `FormChips` / `FormSearchMultiSelect`. */
export interface ChipOption {
  value: string
  label: string
}

/**
 * Charge les référentiels alimentaires (tags régime / allergène + ingrédients)
 * et les expose déjà mis en forme pour les composants de sélection.
 *
 * Le chargement se fait dans `onMounted` : les lectures Supabase ne sont
 * possibles que côté client. En cas d'échec, `error` contient un message et
 * les listes restent vides.
 *
 * Consommé par `register.vue` (étapes régime / allergies / aversions) et par
 * `ProfileFoodFieldset.vue` (dialogue « Modifier le profil »).
 */
export function useFoodOptions() {
  const regimeOptions = ref<ChipOption[]>([])
  const allergeneOptions = ref<ChipOption[]>([])
  const ingredientOptions = ref<ChipOption[]>([])
  const error = ref('')

  onMounted(async () => {
    try {
      const supabase = useSupabase()
      const [dietary, ingredients] = await Promise.all([
        supabase
          .from('tags')
          .select('id, name, category')
          .in('category', ['regime', 'allergene'])
          .order('name', { ascending: true }),
        supabase
          .from('ingredients')
          .select('id, name')
          .order('name', { ascending: true }),
      ])

      if (dietary.error) throw new Error(mapDbError(dietary.error))
      if (ingredients.error) throw new Error(mapDbError(ingredients.error))

      for (const row of dietary.data ?? []) {
        const option: ChipOption = {
          value: row.id as string,
          label: DIETARY_LABELS[row.name as string] ?? (row.name as string),
        }
        if (row.category === 'regime') regimeOptions.value.push(option)
        else if (row.category === 'allergene') allergeneOptions.value.push(option)
      }

      ingredientOptions.value = (ingredients.data ?? []).map(row => ({
        value: row.id as string,
        label: row.name as string,
      }))
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible de charger les options.'
    }
  })

  return { error, regimeOptions, allergeneOptions, ingredientOptions }
}
