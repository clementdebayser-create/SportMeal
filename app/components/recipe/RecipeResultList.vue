<template>
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
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

defineProps<{ loginLink: string }>()

const auth = useAuthStore()
const recipes = useRecipesStore()
const favorites = useFavoritesStore()

const { savingId, saveErrors, saveLabel, onSave } = useRecipeSave()

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
</script>
