import { ref, watch, type Ref } from 'vue'
import type { ProfilePatch } from '~/types/auth'
import { minLength, optionalNumber, required } from '~/utils/validators'

const FIELD_KEYS = ['first_name', 'sport', 'level', 'objectif', 'frequence', 'age', 'sexe', 'poids', 'taille'] as const

function numToStr(n: number | null | undefined): string {
  return n == null ? '' : String(n)
}

function toNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every(v => b.includes(v))
}

/**
 * État + soumission du formulaire « Modifier le profil ».
 *
 * Séparé du composant (qui ne garde que le markup) : instantané des valeurs à
 * l'ouverture, calcul du diff champ par champ, et enregistrement en deux temps
 * (champs `users` puis préférences alimentaires, non bloquantes).
 *
 * @param open  Le `defineModel('open')` du dialogue — sert de déclencheur au
 *              pré-remplissage et est refermé après une sauvegarde réussie.
 * @param onSaved Appelé avec le message de confirmation (relayé en `emit('saved')`).
 */
export function useProfileEditForm(open: Ref<boolean>, onSaved: (message: string) => void) {
  const auth = useAuthStore()

  function currentValues() {
    const p = auth.profile
    return {
      first_name: p?.first_name ?? '',
      sport: p?.sport ?? '',
      level: p?.level ?? '',
      objectif: p?.objectif ?? '',
      frequence: p?.frequence ?? '',
      age: numToStr(p?.age),
      sexe: p?.sexe ?? '',
      poids: numToStr(p?.poids_kg),
      taille: numToStr(p?.taille_cm),
    }
  }

  /** Instantanés à l'ouverture, pour calculer les diffs. */
  let original = currentValues()
  let originalRegime: string[] = []
  let originalAllergene: string[] = []
  let originalDisliked: string[] = []

  const { values, errors, submitError, submitting, handleSubmit } = useForm(currentValues(), {
    first_name: [required('Renseigne ton prénom.'), minLength(2, 'Prénom trop court.')],
    sport: [required('Sélectionne ton sport.')],
    level: [],
    objectif: [],
    frequence: [required('Indique ta fréquence hebdomadaire.')],
    age: [optionalNumber({ min: 10, max: 120, message: 'Âge invalide.' })],
    sexe: [],
    poids: [optionalNumber({ min: 20, max: 400, message: 'Poids invalide.' })],
    taille: [optionalNumber({ min: 100, max: 250, message: 'Taille invalide.' })],
  })

  /* Sélections alimentaires — hors useForm (tableaux). */
  const regimeSelection = ref<string[]>([])
  const allergeneSelection = ref<string[]>([])
  const dislikedIngredients = ref<string[]>([])

  watch(open, (isOpen) => {
    if (!isOpen) return

    original = currentValues()
    Object.assign(values, original)
    for (const key of FIELD_KEYS) errors[key] = undefined
    submitError.value = ''

    originalRegime = auth.profileDietary?.regime.map(t => t.id) ?? []
    originalAllergene = auth.profileDietary?.allergene.map(t => t.id) ?? []
    originalDisliked = auth.profileTastes?.disliked.map(i => i.id) ?? []
    regimeSelection.value = [...originalRegime]
    allergeneSelection.value = [...originalAllergene]
    dislikedIngredients.value = [...originalDisliked]
  })

  function onSubmit() {
    return handleSubmit(async () => {
      const v = values
      const patch: ProfilePatch = {}
      if (v.first_name.trim() !== original.first_name.trim()) patch.first_name = v.first_name.trim()
      if (v.sport !== original.sport) patch.sport = v.sport
      if (v.level !== original.level) patch.level = v.level || null
      if (v.objectif !== original.objectif) patch.objectif = v.objectif || null
      if (v.frequence !== original.frequence) patch.frequence = v.frequence
      if (v.age !== original.age) {
        const n = toNumberOrNull(v.age)
        patch.age = n === null ? null : Math.round(n)
      }
      if (v.sexe !== original.sexe) patch.sexe = v.sexe || null
      if (v.poids !== original.poids) patch.poids_kg = toNumberOrNull(v.poids)
      if (v.taille !== original.taille) patch.taille_cm = toNumberOrNull(v.taille)

      const foodChanged
        = !sameSet(regimeSelection.value, originalRegime)
          || !sameSet(allergeneSelection.value, originalAllergene)
          || !sameSet(dislikedIngredients.value, originalDisliked)

      if (Object.keys(patch).length === 0 && !foodChanged) {
        open.value = false
        return
      }

      const userId = auth.user?.id
      if (!userId) {
        submitError.value = 'Session introuvable. Reconnecte-toi et réessaie.'
        return
      }

      const settings = useAccountSettings()

      if (Object.keys(patch).length > 0) {
        await settings.updateProfileFields(userId, patch)
      }

      const foodFailures: string[] = []
      if (foodChanged) {
        const { failures } = await settings.updateFoodPreferences(userId, {
          regimeTagIds: regimeSelection.value,
          allergeneTagIds: allergeneSelection.value,
          dislikedIngredientIds: dislikedIngredients.value,
        })
        foodFailures.push(...failures)
      }

      await auth.loadProfile()

      if (foodFailures.length > 0) {
        submitError.value = `Enregistré, mais ${foodFailures.join(' et ')} n'ont pas pu être mis à jour.`
        return
      }

      open.value = false
      onSaved('Profil mis à jour.')
    })
  }

  return {
    values,
    errors,
    submitError,
    submitting,
    regimeSelection,
    allergeneSelection,
    dislikedIngredients,
    onSubmit,
  }
}
