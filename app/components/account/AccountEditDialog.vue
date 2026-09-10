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

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [message: string] }>()

const {
  values,
  errors,
  submitError,
  submitting,
  regimeSelection,
  allergeneSelection,
  dislikedIngredients,
  onSubmit,
} = useProfileEditForm(open, message => emit('saved', message))
</script>
