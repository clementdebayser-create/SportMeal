<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-5xl px-6 py-16">
      <p class="mb-3 text-sm font-medium tracking-wide text-primary">Ce soir</p>
      <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Mon repas du soir
      </h1>
      <p class="mt-3 max-w-2xl text-base text-muted-foreground">
        Choisis tes préférences — on te propose les repas du soir qui correspondent.
      </p>

      <div class="mt-10 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <!-- Colonne gauche : récap du profil -->
        <aside class="lg:sticky lg:top-8 lg:self-start">
          <ClientOnly>
            <div
              v-if="auth.isAuthenticated && auth.profile"
              class="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm"
            >
              <h2 class="font-serif text-lg font-medium text-foreground">
                Mon profil
              </h2>
              <p class="mt-1 text-xs text-muted-foreground">
                Les suggestions s'y adaptent automatiquement.
              </p>

              <dl class="mt-4 space-y-3">
                <div v-for="item in profileRecap" :key="item.label">
                  <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {{ item.label }}
                  </dt>
                  <dd class="mt-0.5 text-sm font-medium text-foreground break-words">
                    {{ item.value }}
                  </dd>
                </div>
              </dl>

              <Button
                variant="outline"
                class="mt-5 h-10 w-full rounded-xl"
                @click="editOpen = true"
              >
                Modifier le profil
              </Button>
              <p v-if="savedMessage" class="mt-2 text-xs text-muted-foreground">
                {{ savedMessage }}
              </p>
            </div>

            <div
              v-else
              class="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm"
            >
              <h2 class="font-serif text-lg font-medium text-foreground">
                Personnalise tes suggestions
              </h2>
              <p class="mt-2 text-sm text-muted-foreground">
                Connecte-toi pour filtrer automatiquement les repas selon ton régime,
                tes allergies et les ingrédients que tu évites.
              </p>
              <Button as-child variant="outline" class="mt-4 h-10 w-full rounded-xl">
                <NuxtLink :to="loginLink">Se connecter</NuxtLink>
              </Button>
            </div>

            <template #fallback>
              <div class="h-56 rounded-3xl border border-border/70 bg-card/40" />
            </template>
          </ClientOnly>
        </aside>

        <!-- Colonne droite : choix du repas + résultats + repas enregistrés -->
        <div>
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
            <!-- Personnalisation selon le profil -->
            <div
              v-if="showProfileNote"
              class="mt-6 rounded-2xl border border-border/70 bg-accent/40 px-4 py-3 text-sm text-foreground"
            >
              <template v-if="!recipes.ignoreProfile">
                {{ recipes.hiddenByProfile }} recette{{ recipes.hiddenByProfile > 1 ? 's' : '' }}
                masquée{{ recipes.hiddenByProfile > 1 ? 's' : '' }} selon ton profil
                ({{ profileConstraints.join(', ') }}).
                <button
                  type="button"
                  class="ml-1 font-medium text-primary underline-offset-4 hover:underline"
                  @click="recipes.showAllIgnoringProfile()"
                >
                  Tout voir quand même
                </button>
              </template>
              <template v-else>
                Filtre profil désactivé — toutes les recettes sont affichées.
                <button
                  type="button"
                  class="ml-1 font-medium text-primary underline-offset-4 hover:underline"
                  @click="recipes.restoreProfileFilter()"
                >
                  Réappliquer mon profil
                </button>
              </template>
            </div>

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

          <!-- Repas enregistrés -->
          <ClientOnly>
            <div v-if="auth.isAuthenticated" class="mt-14">
              <h2 class="font-serif text-2xl font-medium text-foreground">
                Mes repas enregistrés
              </h2>

              <p
                v-if="favorites.status === 'idle' || favorites.status === 'loading'"
                class="mt-3 text-sm text-muted-foreground"
              >
                Chargement…
              </p>

              <div v-else-if="favorites.status === 'error'" class="mt-3">
                <p class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {{ favorites.error || 'Impossible de charger tes repas enregistrés.' }}
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  class="mt-3 h-11 rounded-2xl"
                  @click="favorites.retry()"
                >
                  Réessayer
                </Button>
              </div>

              <template v-else>
                <p v-if="!favorites.items.length" class="mt-3 text-sm text-muted-foreground">
                  Aucun repas enregistré pour l’instant. Lance une recherche ci-dessus pour en ajouter.
                </p>
                <div v-else class="mt-4 grid gap-4 sm:grid-cols-2">
                  <RecipeCard
                    v-for="recipe in favorites.items"
                    :key="recipe.id"
                    :recipe="recipe"
                    compact
                  >
                    <template #actions>
                      <Button
                        variant="ghost"
                        class="h-9 rounded-xl px-3 text-sm text-muted-foreground hover:text-foreground"
                        @click="onRemove(recipe.id)"
                      >
                        Retirer
                      </Button>
                    </template>
                  </RecipeCard>
                </div>
                <p v-if="removeError" class="mt-3 text-sm text-destructive">{{ removeError }}</p>
              </template>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>

    <AccountEditDialog v-model:open="editOpen" @saved="onProfileSaved" />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { OBJECTIVES } from '~/constants/profile'
import { MEAL_TYPES, PREP_TIME_LIMITS } from '~/constants/recipeFilters'
import type { RecipeRow } from '~/types/recipe'
import { joinLabels, joinNames, objectifLabel } from '~/utils/profileFormat'

useHead({ title: 'Mon repas du soir — SportMeal' })

const auth = useAuthStore()
const recipes = useRecipesStore()
const favorites = useFavoritesStore()

const loginLink = `/login?redirect=${encodeURIComponent('/recipes')}`

const editOpen = ref(false)
const savedMessage = ref('')

const { values, handleSubmit } = useForm(
  { mealType: '', objective: '', maxTime: '' },
  {},
)

/* Pré-remplit l'objectif avec celui du profil, tant que l'utilisateur n'y a pas touché. */
watch(() => auth.profile?.objectif, (objectif) => {
  if (objectif && !values.objective) values.objective = objectif
}, { immediate: true })

/* Récap du profil affiché à gauche. */
const profileRecap = computed(() => [
  { label: 'Objectif', value: objectifLabel(auth.profile?.objectif) },
  { label: 'Régime alimentaire', value: joinLabels(auth.profileDietary?.regime) },
  { label: 'Allergies / intolérances', value: joinLabels(auth.profileDietary?.allergene) },
  { label: 'Ingrédients évités', value: joinNames(auth.profileTastes?.disliked) },
])

/* Libellés des contraintes de profil réellement appliquées aux suggestions. */
const profileConstraints = computed(() => {
  const parts: string[] = []
  for (const tag of auth.profileDietary?.regime ?? []) {
    if (tag.name === 'vegan') parts.push('végan')
    else if (tag.name === 'pescetarien') parts.push('pescétarien')
    // halal / casher / sans_porc : aucune recette concernée dans le catalogue actuel.
  }
  for (const tag of auth.profileDietary?.allergene ?? []) {
    parts.push(`sans ${tag.label.toLowerCase()}`)
  }
  const disliked = auth.profileTastes?.disliked.length ?? 0
  if (disliked > 0) parts.push(`${disliked} ingrédient${disliked > 1 ? 's' : ''} évité${disliked > 1 ? 's' : ''}`)
  return parts
})

const showProfileNote = computed(() =>
  auth.isAuthenticated
  && profileConstraints.value.length > 0
  && (recipes.hiddenByProfile > 0 || recipes.ignoreProfile),
)

/* Si les préférences alimentaires arrivent (ou changent) après une recherche, on re-filtre. */
watch([() => auth.profileDietary, () => auth.profileTastes], () => {
  if (recipes.searched) recipes.applyFilters()
})

function onProfileSaved(message: string) {
  savedMessage.value = message
}

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

const removeError = ref('')
async function onRemove(recipeId: string) {
  removeError.value = ''
  try {
    await favorites.remove(recipeId)
  }
  catch (error) {
    removeError.value = error instanceof Error ? error.message : 'Suppression impossible.'
  }
}

function loadUserData() {
  favorites.load()
  if (!auth.profileDietary) auth.loadFoodPreferences()
}

onMounted(() => {
  if (auth.isAuthenticated) loadUserData()
})
watch(() => auth.isAuthenticated, (authed) => {
  if (authed) loadUserData()
})
</script>
