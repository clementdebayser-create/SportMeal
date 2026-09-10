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
          <RecipeProfileSummary
            :login-link="loginLink"
            :saved-message="savedMessage"
            @edit="editOpen = true"
            @open-saved="savedOpen = true"
          />
        </aside>

        <!-- Colonne droite : choix du repas + résultats -->
        <div>
          <RecipeSearchForm :login-link="loginLink" />
          <RecipeResultList :login-link="loginLink" />
        </div>
      </div>
    </div>

    <AccountEditDialog v-model:open="editOpen" @saved="onProfileSaved" />
    <RecipeSavedDialog v-model:open="savedOpen" />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

useHead({ title: 'Mon repas du soir — SportMeal' })

const auth = useAuthStore()
const favorites = useFavoritesStore()

const loginLink = `/login?redirect=${encodeURIComponent('/recipes')}`

const editOpen = ref(false)
const savedOpen = ref(false)
const savedMessage = ref('')

function onProfileSaved(message: string) {
  savedMessage.value = message
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
