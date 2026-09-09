<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-3xl px-6 py-16">
      <p class="mb-3 text-sm font-medium tracking-wide text-primary">Ce soir</p>
      <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Mon repas du soir
      </h1>
      <p class="mt-3 max-w-2xl text-base text-muted-foreground">
        Une suggestion de repas, prête à cuisiner. Pas convaincu ? Demandes-en une autre.
      </p>

      <div class="mt-8">
        <Button
          size="lg"
          class="h-12 rounded-2xl px-7 text-base shadow-sm"
          :disabled="recipes.status === 'loading'"
          @click="recipes.suggest()"
        >
          {{ suggestLabel }}
        </Button>
      </div>

      <p
        v-if="recipes.status === 'error'"
        class="mt-4 rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
      >
        {{ recipes.error }}
      </p>

      <div v-if="recipes.current" class="mt-8">
        <RecipeCard :recipe="recipes.current">
          <template #actions>
            <ClientOnly>
              <div class="flex flex-col gap-2">
                <template v-if="auth.isAuthenticated">
                  <Button
                    variant="outline"
                    class="h-11 rounded-2xl"
                    :disabled="isSaved || saving"
                    @click="onSave"
                  >
                    {{ saveLabel }}
                  </Button>
                  <p v-if="saveError" class="text-sm text-destructive">{{ saveError }}</p>
                </template>
                <Button v-else as-child variant="outline" class="h-11 rounded-2xl">
                  <NuxtLink :to="loginLink">Connecte-toi pour enregistrer</NuxtLink>
                </Button>
              </div>
            </ClientOnly>
          </template>
        </RecipeCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

useHead({ title: 'Mon repas du soir — SportMeal' })

const auth = useAuthStore()
const recipes = useRecipesStore()
const favorites = useFavoritesStore()

const saving = ref(false)
const saveError = ref('')

const loginLink = `/login?redirect=${encodeURIComponent('/recipes')}`

const suggestLabel = computed(() => {
  if (recipes.status === 'loading') return 'Recherche…'
  return recipes.current ? 'Proposer un autre repas' : 'Proposer un repas'
})

const isSaved = computed(() =>
  recipes.current ? favorites.isSaved(recipes.current.id) : false,
)

const saveLabel = computed(() => {
  if (isSaved.value) return 'Enregistré ✓'
  return saving.value ? 'Enregistrement…' : 'Enregistrer ce repas'
})

onMounted(() => {
  if (auth.isAuthenticated) favorites.load()
})
watch(() => auth.isAuthenticated, (authed) => {
  if (authed) favorites.load()
})

async function onSave() {
  if (!recipes.current) return
  saveError.value = ''
  saving.value = true
  try {
    await favorites.add(recipes.current)
  }
  catch (error) {
    saveError.value = error instanceof Error ? error.message : 'Enregistrement impossible.'
  }
  finally {
    saving.value = false
  }
}
</script>
