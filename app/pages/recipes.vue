<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-4xl px-6 py-16">
      <p class="mb-3 text-sm font-medium tracking-wide text-primary">Ce soir</p>
      <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Mon repas du soir
      </h1>
      <p class="mt-3 max-w-2xl text-base text-muted-foreground">
        Choisis tes préférences — on te propose les repas du soir qui correspondent.
      </p>

      <form
        class="mt-8 grid gap-5 sm:grid-cols-3"
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

        <div class="sm:col-span-3">
          <Button
            type="submit"
            size="lg"
            class="h-12 rounded-2xl px-7 text-base shadow-sm"
            :disabled="recipes.status === 'loading'"
          >
            {{ recipes.status === 'loading' ? 'Recherche…' : 'Voir les repas' }}
          </Button>
        </div>
      </form>

      <!-- Erreur technique -->
      <p
        v-if="recipes.status === 'error'"
        class="mt-6 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
      >
        {{ recipes.error }}
      </p>

      <!-- Résultats -->
      <template v-else-if="recipes.searched && recipes.status === 'ready'">
        <p
          v-if="!recipes.results.length"
          class="mt-6 rounded-2xl border border-border/70 bg-card/60 px-4 py-4 text-sm text-muted-foreground"
        >
          Aucun repas ne correspond à cette combinaison. Essaie d’assouplir un critère —
          un autre objectif, un type de plat différent, ou un temps de préparation plus large.
        </p>

        <template v-else>
          <p class="mt-6 text-sm text-muted-foreground">
            {{ recipes.results.length }} repas trouvé{{ recipes.results.length > 1 ? 's' : '' }}
          </p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <RecipeCard
              v-for="recipe in recipes.results"
              :key="recipe.id"
              :recipe="recipe"
              compact
            >
              <template #actions>
                <ClientOnly>
                  <template v-if="auth.isAuthenticated">
                    <Button
                      variant="outline"
                      class="h-10 rounded-xl"
                      :disabled="favorites.isSaved(recipe.id) || savingId === recipe.id"
                      @click="onSave(recipe)"
                    >
                      {{ saveLabel(recipe.id) }}
                    </Button>
                    <p v-if="saveErrors[recipe.id]" class="mt-1.5 text-sm text-destructive">
                      {{ saveErrors[recipe.id] }}
                    </p>
                  </template>
                  <Button v-else as-child variant="outline" class="h-10 rounded-xl">
                    <NuxtLink :to="loginLink">Connecte-toi pour enregistrer</NuxtLink>
                  </Button>
                </ClientOnly>
              </template>
            </RecipeCard>
          </div>
        </template>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { OBJECTIVES } from '~/constants/profile'
import { MEAL_TYPES, PREP_TIME_LIMITS } from '~/constants/recipeFilters'
import type { RecipeRow } from '~/types/recipe'

useHead({ title: 'Mon repas du soir — SportMeal' })

const auth = useAuthStore()
const recipes = useRecipesStore()
const favorites = useFavoritesStore()

const loginLink = `/login?redirect=${encodeURIComponent('/recipes')}`

const { values, handleSubmit } = useForm(
  { mealType: '', objective: '', maxTime: '' },
  {},
)

function onSubmit() {
  return handleSubmit(() =>
    recipes.search({
      mealType: values.mealType || null,
      objective: values.objective || null,
      maxMinutes: values.maxTime ? Number(values.maxTime) : null,
    }),
  )
}

/* Enregistrement — état individuel par recette. */
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

onMounted(() => {
  if (auth.isAuthenticated) favorites.load()
})
watch(() => auth.isAuthenticated, (authed) => {
  if (authed) favorites.load()
})
</script>
