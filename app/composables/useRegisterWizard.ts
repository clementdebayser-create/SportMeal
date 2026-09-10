import { computed, ref } from 'vue'
import { REGISTER_STEP_COUNT, REGISTER_STEP_FIELDS, REGISTER_STEPS } from '~/constants/register'
import type { RegisterPayload } from '~/types/auth'
import type { Sport, TrainingFrequency } from '~/types/profile'
import type { RegisterFormValues } from '~/types/register'
import { email, minLength, optionalNumber, required } from '~/utils/validators'

function toNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

/**
 * État et logique du wizard d'inscription en 5 étapes : navigation, validation
 * par étape, chargement des référentiels alimentaires, construction du payload
 * et soumission. Le composant `register.vue` ne garde que le markup.
 */
export function useRegisterWizard() {
  const auth = useAuthStore()

  const step = ref(1)
  const currentStep = computed(() => REGISTER_STEPS[step.value - 1] ?? REGISTER_STEPS[0])
  const partialWarning = ref<string[] | null>(null)

  const {
    values,
    errors,
    submitting,
    submitError,
    handleSubmit,
    validateFields,
  } = useForm<RegisterFormValues>(
    {
      name: '', email: '', password: '', sport: '', frequency: '',
      level: '', objectif: '',
      age: '', sexe: '', poids: '', taille: '',
    },
    {
      name: [required('Renseigne ton prénom.'), minLength(2, 'Prénom trop court.')],
      email: [required('Renseigne ton adresse e-mail.'), email()],
      password: [required('Choisis un mot de passe.'), minLength(8, '8 caractères minimum.')],
      sport: [required('Sélectionne ton sport.')],
      frequency: [required('Indique ta fréquence hebdomadaire.')],
      level: [],
      objectif: [],
      age: [optionalNumber({ min: 10, max: 120, message: 'Âge invalide.' })],
      sexe: [],
      poids: [optionalNumber({ min: 20, max: 400, message: 'Poids invalide.' })],
      taille: [optionalNumber({ min: 100, max: 250, message: 'Taille invalide.' })],
    },
  )

  /* Sélections multiples — hors useForm (qui ne gère que des champs texte). */
  const regimeSelection = ref<string[]>([])
  const allergeneSelection = ref<string[]>([])
  const dislikedIngredients = ref<string[]>([])

  /* Référentiels alimentaires (chargés côté client). */
  const {
    error: optionsError,
    regimeOptions: regimeChipOptions,
    allergeneOptions: allergeneChipOptions,
    ingredientOptions: ingredientChipOptions,
  } = useFoodOptions()

  function goPrev() {
    step.value = Math.max(1, step.value - 1)
  }

  function goNext() {
    if (validateFields(REGISTER_STEP_FIELDS[step.value] ?? [])) {
      step.value = Math.min(REGISTER_STEP_COUNT, step.value + 1)
    }
  }

  function onSubmit() {
    if (!validateFields(REGISTER_STEP_FIELDS[1] ?? [])) {
      step.value = 1
      return
    }
    if (!validateFields(REGISTER_STEP_FIELDS[2] ?? [])) {
      step.value = 2
      return
    }

    return handleSubmit(async (v) => {
      const age = toNumberOrNull(v.age)
      const payload: RegisterPayload = {
        name: v.name,
        email: v.email,
        password: v.password,
        sport: v.sport as Sport,
        frequency: v.frequency as TrainingFrequency,
        extras: {
          level: v.level || null,
          objectif: v.objectif || null,
          age: age === null ? null : Math.round(age),
          sexe: v.sexe || null,
          poidsKg: toNumberOrNull(v.poids),
          tailleCm: toNumberOrNull(v.taille),
          dietaryTagIds: [...regimeSelection.value, ...allergeneSelection.value],
          likedIngredientIds: [],
          dislikedIngredientIds: dislikedIngredients.value,
        },
      }

      const { needsEmailConfirmation, failedExtras } = await auth.register(payload)

      if (needsEmailConfirmation) {
        submitError.value = 'Compte créé. Confirme ton adresse e-mail via le lien reçu, puis connecte-toi.'
        return
      }
      if (failedExtras.length > 0) {
        partialWarning.value = failedExtras
        return
      }
      await navigateTo('/account')
    })
  }

  return {
    STEP_COUNT: REGISTER_STEP_COUNT,
    step,
    currentStep,
    partialWarning,
    values,
    errors,
    submitting,
    submitError,
    regimeSelection,
    allergeneSelection,
    dislikedIngredients,
    optionsError,
    regimeChipOptions,
    allergeneChipOptions,
    ingredientChipOptions,
    goPrev,
    goNext,
    onSubmit,
  }
}
