<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg flex-col justify-center px-6 py-16">
      <div class="animate-fade-up">
        <p class="mb-3 text-sm font-medium tracking-wide text-primary">
          Commence maintenant
        </p>
        <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Créer un compte
        </h1>
        <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
          {{ currentStep.hint }}
        </p>
      </div>

      <div
        class="animate-fade-up mt-8 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        style="animation-delay: 100ms"
      >
        <!-- Compte créé, mais certaines préférences n'ont pas pu être enregistrées -->
        <div v-if="partialWarning" class="flex flex-col gap-4">
          <h2 class="font-serif text-2xl font-medium text-foreground">
            Ton compte est créé
          </h2>
          <p class="rounded-xl bg-accent/60 px-3.5 py-2.5 text-sm text-foreground">
            En revanche, {{ partialWarning.join(' et ') }} n’ont pas pu être enregistrés.
            Tu pourras les renseigner plus tard depuis ton compte.
          </p>
          <Button size="lg" class="h-12 rounded-2xl" @click="navigateTo('/account')">
            Aller à mon compte
          </Button>
        </div>

        <template v-else>
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Étape {{ step }} / {{ STEP_COUNT }} · {{ currentStep.title }}
          </p>
          <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary transition-all"
              :style="{ width: `${(step / STEP_COUNT) * 100}%` }"
            />
          </div>

          <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
            <!-- Étape 1 : compte + pratique -->
            <template v-if="step === 1">
              <FormField label="Prénom" html-for="name" :error="errors.name">
                <Input id="name" v-model="values.name" type="text" autocomplete="given-name" placeholder="Alex" :aria-invalid="!!errors.name" />
              </FormField>
              <FormField label="Adresse e-mail" html-for="email" :error="errors.email">
                <Input id="email" v-model="values.email" type="email" autocomplete="email" placeholder="toi@exemple.com" :aria-invalid="!!errors.email" />
              </FormField>
              <FormField label="Mot de passe" html-for="password" :error="errors.password">
                <Input id="password" v-model="values.password" type="password" autocomplete="new-password" placeholder="8 caractères minimum" :aria-invalid="!!errors.password" />
              </FormField>
              <FormField label="Sport pratiqué" html-for="sport" :error="errors.sport">
                <FormSelect id="sport" v-model="values.sport" :options="SPORTS" placeholder="Choisis ton sport…" :aria-invalid="!!errors.sport" />
              </FormField>
              <FormField label="Niveau" html-for="level" :error="errors.level">
                <FormSelect id="level" v-model="values.level" :options="LEVELS" neutral-label="Non renseigné" />
              </FormField>
              <FormField label="Objectif" html-for="objectif" :error="errors.objectif">
                <FormSelect id="objectif" v-model="values.objectif" :options="OBJECTIVES" neutral-label="Non renseigné" />
              </FormField>
              <FormField label="Fréquence par semaine" :error="errors.frequency">
                <FormSegmentedControl v-model="values.frequency" :options="TRAINING_FREQUENCIES" />
              </FormField>
            </template>

            <!-- Étape 2 : données physiques (optionnel) -->
            <template v-else-if="step === 2">
              <p class="text-sm text-muted-foreground">
                Facultatif — utile plus tard pour affiner tes portions. Tu peux passer.
              </p>
              <FormField label="Âge" html-for="age" :error="errors.age">
                <Input id="age" v-model="values.age" type="number" inputmode="numeric" min="10" max="120" placeholder="ex : 28" :aria-invalid="!!errors.age" />
              </FormField>
              <FormField label="Sexe" html-for="sexe" :error="errors.sexe">
                <FormSelect id="sexe" v-model="values.sexe" :options="SEXES" neutral-label="Non renseigné" />
              </FormField>
              <FormField label="Poids (kg)" html-for="poids" :error="errors.poids">
                <Input id="poids" v-model="values.poids" type="number" inputmode="decimal" min="20" max="400" step="0.1" placeholder="ex : 72" :aria-invalid="!!errors.poids" />
              </FormField>
              <FormField label="Taille (cm)" html-for="taille" :error="errors.taille">
                <Input id="taille" v-model="values.taille" type="number" inputmode="numeric" min="100" max="250" placeholder="ex : 178" :aria-invalid="!!errors.taille" />
              </FormField>
            </template>

            <!-- Étape 3 : régime alimentaire (optionnel) -->
            <template v-else-if="step === 3">
              <p class="text-sm text-muted-foreground">
                Sélectionne ce qui s’applique. Facultatif.
              </p>
              <p v-if="optionsError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {{ optionsError }} Tu pourras le renseigner plus tard.
              </p>
              <FormChips v-else v-model="regimeSelection" :options="regimeChipOptions" />
            </template>

            <!-- Étape 4 : allergies / intolérances (optionnel) -->
            <template v-else-if="step === 4">
              <p class="rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground">
                ⚠️ Les recettes contenant ces ingrédients seront exclues de tes suggestions.
              </p>
              <p v-if="optionsError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {{ optionsError }} Tu pourras le renseigner plus tard.
              </p>
              <FormChips v-else v-model="allergeneSelection" :options="allergeneChipOptions" />
            </template>

            <!-- Étape 5 : aversions (facultatif) -->
            <template v-else-if="step === 5">
              <p class="text-sm text-muted-foreground">
                Facultatif — recherche un ingrédient et ajoute-le à la liste.
              </p>
              <p v-if="optionsError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {{ optionsError }} Tu pourras le renseigner plus tard.
              </p>
              <div v-else>
                <p class="mb-2 text-sm font-medium text-foreground">Ingrédients que tu n’aimes pas</p>
                <FormSearchMultiSelect
                  v-model="dislikedIngredients"
                  :options="ingredientChipOptions"
                  placeholder="Rechercher un ingrédient…"
                  empty-text="Aucun ingrédient trouvé."
                />
              </div>
            </template>

            <p v-if="submitError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {{ submitError }}
            </p>

            <div class="mt-1 flex items-center gap-3">
              <Button v-if="step > 1" type="button" variant="ghost" class="h-11 rounded-2xl" @click="goPrev">
                Précédent
              </Button>
              <div class="flex-1" />
              <Button
                v-if="step > 1 && step < STEP_COUNT"
                type="submit"
                variant="ghost"
                class="h-11 rounded-2xl text-muted-foreground hover:text-foreground"
                :disabled="submitting"
              >
                Créer mon compte
              </Button>
              <Button v-if="step < STEP_COUNT" type="button" class="h-11 rounded-2xl px-6" @click="goNext">
                Suivant
              </Button>
              <Button v-else type="submit" size="lg" class="h-11 rounded-2xl px-6" :disabled="submitting">
                {{ submitting ? 'Création…' : 'Créer mon compte' }}
              </Button>
            </div>
          </form>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            Tu as déjà un compte ?
            <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
              Se connecter
            </NuxtLink>
          </p>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { LEVELS, OBJECTIVES, SEXES, SPORTS, TRAINING_FREQUENCIES } from '~/constants/profile'
import type { Sport, TrainingFrequency } from '~/types/profile'
import type { RegisterPayload } from '~/types/auth'
import { email, minLength, optionalNumber, required } from '~/utils/validators'

useHead({ title: 'Créer un compte — SportMeal' })

const auth = useAuthStore()

const STEP_COUNT = 5
const STEPS = [
  { title: 'Compte', hint: 'Crée ton compte et indique ta pratique sportive.' },
  { title: 'Données physiques', hint: 'Quelques infos optionnelles pour affiner tes portions plus tard.' },
  { title: 'Régime alimentaire', hint: 'Tes contraintes de régime, si tu en as.' },
  { title: 'Allergies', hint: 'Ce qui doit être exclu de tes suggestions.' },
  { title: 'Aversions', hint: 'Les ingrédients que tu préfères éviter.' },
] as const

const step = ref(1)
const currentStep = computed(() => STEPS[step.value - 1] ?? STEPS[0])
const partialWarning = ref<string[] | null>(null)

const {
  values,
  errors,
  submitting,
  submitError,
  handleSubmit,
  validateFields,
} = useForm(
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

const STEP_FIELDS: Record<number, readonly string[]> = {
  1: ['name', 'email', 'password', 'sport', 'frequency', 'level', 'objectif'],
  2: ['age', 'poids', 'taille'],
  3: [],
  4: [],
  5: [],
}

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
  if (validateFields(STEP_FIELDS[step.value] ?? [])) {
    step.value = Math.min(STEP_COUNT, step.value + 1)
  }
}

function toNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

function onSubmit() {
  if (!validateFields(STEP_FIELDS[1])) {
    step.value = 1
    return
  }
  if (!validateFields(STEP_FIELDS[2])) {
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
</script>
