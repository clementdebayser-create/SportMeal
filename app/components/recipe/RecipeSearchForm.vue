<template>
  <form
    class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
    novalidate
    @submit.prevent="onSubmit"
  >
    <FormField label="Type de plat" html-for="mealType">
      <FormSelect
        id="mealType"
        v-model="values.mealType"
        :options="MEAL_TYPES"
        neutral-label="Peu importe"
      />
    </FormField>

    <FormField label="Objectif" html-for="objective">
      <FormSelect
        id="objective"
        v-model="values.objective"
        :options="OBJECTIVES"
        neutral-label="Peu importe"
      />
    </FormField>

    <FormField label="Temps de préparation max" html-for="maxTime">
      <FormSelect
        id="maxTime"
        v-model="values.maxTime"
        :options="PREP_TIME_LIMITS"
        neutral-label="Peu importe"
      />
    </FormField>

    <div class="sm:col-span-2 xl:col-span-3">
      <ClientOnly>
        <Button
          v-if="auth.isAuthenticated"
          type="submit"
          size="lg"
          class="h-12 rounded-2xl px-7 text-base shadow-sm"
          :disabled="recipes.status === 'loading'"
        >
          {{ recipes.status === 'loading' ? 'Recherche…' : 'Voir les repas' }}
        </Button>
        <div
          v-else
          class="rounded-2xl border border-border/70 bg-accent/40 px-4 py-4"
        >
          <p class="text-sm text-foreground">
            Connecte-toi pour générer une recette adaptée à ton profil et
            enregistrer tes repas.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button as-child class="h-10 rounded-xl">
              <NuxtLink :to="loginLink">Se connecter</NuxtLink>
            </Button>
            <Button as-child variant="outline" class="h-10 rounded-xl">
              <NuxtLink to="/register">Créer un compte</NuxtLink>
            </Button>
          </div>
        </div>
        <template #fallback>
          <Button
            type="submit"
            size="lg"
            disabled
            class="h-12 rounded-2xl px-7 text-base shadow-sm"
          >
            Voir les repas
          </Button>
        </template>
      </ClientOnly>
    </div>
  </form>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { OBJECTIVES } from '~/constants/profile'
import { MEAL_TYPES, PREP_TIME_LIMITS } from '~/constants/recipeFilters'

defineProps<{ loginLink: string }>()

const auth = useAuthStore()
const recipes = useRecipesStore()

const { values, handleSubmit } = useForm(
  { mealType: '', objective: '', maxTime: '' },
  {},
)

/* Pré-remplit l'objectif avec celui du profil, tant que l'utilisateur n'y a pas touché. */
watch(() => auth.profile?.objectif, (objectif) => {
  if (objectif && !values.objective) values.objective = objectif
}, { immediate: true })

function onSubmit() {
  if (!auth.isAuthenticated) return
  return handleSubmit(() =>
    recipes.search({
      mealType: values.mealType || null,
      objective: values.objective || null,
      maxMinutes: values.maxTime ? Number(values.maxTime) : null,
    }),
  )
}
</script>
