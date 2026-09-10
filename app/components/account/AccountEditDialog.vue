<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-overlay-in"
      />
      <div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogContent
          class="pointer-events-auto max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-y-auto rounded-3xl border border-border/70 bg-card p-6 shadow-lg data-[state=open]:animate-dialog-in sm:p-8"
        >
          <DialogTitle class="font-serif text-2xl font-medium text-foreground">
            Modifier le profil
          </DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            Mets à jour tes informations. Tout est modifiable, rien n'est obligatoire (hors prénom, sport et fréquence).
          </DialogDescription>

          <form class="mt-6 flex flex-col gap-8" novalidate @submit.prevent="onSubmit">
            <div class="grid gap-x-10 gap-y-8 lg:grid-cols-2">
              <!-- Profil sportif -->
              <fieldset class="flex flex-col gap-4">
                <legend class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Profil sportif
                </legend>

                <FormField label="Prénom" html-for="edit-first-name" :error="errors.first_name">
                  <Input id="edit-first-name" v-model="values.first_name" type="text" autocomplete="given-name" :aria-invalid="!!errors.first_name" />
                </FormField>
                <FormField label="Sport pratiqué" html-for="edit-sport" :error="errors.sport">
                  <FormSelect id="edit-sport" v-model="values.sport" :options="SPORTS" :aria-invalid="!!errors.sport" />
                </FormField>
                <FormField label="Niveau" html-for="edit-level" :error="errors.level">
                  <FormSelect id="edit-level" v-model="values.level" :options="LEVELS" neutral-label="Non renseigné" />
                </FormField>
                <FormField label="Objectif" html-for="edit-objectif" :error="errors.objectif">
                  <FormSelect id="edit-objectif" v-model="values.objectif" :options="OBJECTIVES" neutral-label="Non renseigné" />
                </FormField>
                <FormField label="Fréquence par semaine" :error="errors.frequence">
                  <FormSegmentedControl v-model="values.frequence" :options="TRAINING_FREQUENCIES" />
                </FormField>
              </fieldset>

              <!-- Données physiques -->
              <fieldset class="flex flex-col gap-4">
                <legend class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Données physiques
                </legend>

                <div class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  <FormField label="Âge" html-for="edit-age" :error="errors.age">
                    <Input id="edit-age" v-model="values.age" type="number" inputmode="numeric" min="10" max="120" :aria-invalid="!!errors.age" />
                  </FormField>
                  <FormField label="Sexe" html-for="edit-sexe" :error="errors.sexe">
                    <FormSelect id="edit-sexe" v-model="values.sexe" :options="SEXES" neutral-label="Non renseigné" />
                  </FormField>
                  <FormField label="Poids (kg)" html-for="edit-poids" :error="errors.poids">
                    <Input id="edit-poids" v-model="values.poids" type="number" inputmode="decimal" min="20" max="400" step="0.1" :aria-invalid="!!errors.poids" />
                  </FormField>
                  <FormField label="Taille (cm)" html-for="edit-taille" :error="errors.taille">
                    <Input id="edit-taille" v-model="values.taille" type="number" inputmode="numeric" min="100" max="250" :aria-invalid="!!errors.taille" />
                  </FormField>
                </div>
              </fieldset>
            </div>

            <!-- Alimentation -->
            <FormProfileFoodFieldset
              v-model:regime="regimeSelection"
              v-model:allergene="allergeneSelection"
              v-model:disliked="dislikedIngredients"
            />

            <p
              v-if="submitError"
              class="whitespace-pre-line rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
            >
              {{ submitError }}
            </p>

            <div class="flex flex-col gap-3 sm:flex-row-reverse">
              <Button type="submit" class="h-11 rounded-2xl" :disabled="submitting">
                {{ submitting ? 'Enregistrement…' : 'Enregistrer' }}
              </Button>
              <DialogClose as-child>
                <Button type="button" variant="ghost" class="h-11 rounded-2xl">
                  Annuler
                </Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { LEVELS, OBJECTIVES, SEXES, SPORTS, TRAINING_FREQUENCIES } from '~/constants/profile'
import type { ProfilePatch } from '~/types/auth'
import { minLength, optionalNumber, required } from '~/utils/validators'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [message: string] }>()

const auth = useAuthStore()

const FIELD_KEYS = ['first_name', 'sport', 'level', 'objectif', 'frequence', 'age', 'sexe', 'poids', 'taille'] as const

function numToStr(n: number | null | undefined): string {
  return n == null ? '' : String(n)
}

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

/* Sélections alimentaires — hors useForm (tableaux). Les référentiels et la
   gestion d'erreur de chargement sont dans `ProfileFoodFieldset`. */
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

function sameSet(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every(v => b.includes(v))
}

function toNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim().replace(',', '.')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

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
    emit('saved', 'Profil mis à jour.')
  })
}
</script>
