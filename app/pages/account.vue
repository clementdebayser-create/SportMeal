<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-2xl px-6 py-16">
      <ClientOnly>
        <!-- Déconnecté : la redirection vers /login est en cours -->
        <p v-if="!auth.isAuthenticated" class="text-sm text-muted-foreground">
          Redirection…
        </p>

        <!-- État 1 : chargement du profil -->
        <p
          v-else-if="!auth.ready || auth.profileStatus === 'idle' || auth.profileStatus === 'loading'"
          class="text-sm text-muted-foreground"
        >
          Chargement…
        </p>

        <!-- État 2 : erreur de chargement du profil -->
        <div v-else-if="auth.profileStatus === 'error'" class="animate-fade-up">
          <p class="mb-3 text-sm font-medium tracking-wide text-primary">
            Mon compte
          </p>
          <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Profil indisponible
          </h1>
          <p class="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {{ auth.profileError || 'Impossible de charger ton profil.' }}
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              class="h-11 rounded-2xl"
              :disabled="auth.profileStatus === 'loading'"
              @click="auth.retryProfile()"
            >
              Réessayer
            </Button>
            <Button
              variant="ghost"
              size="lg"
              class="h-11 rounded-2xl text-muted-foreground hover:text-foreground"
              @click="logout()"
            >
              Se déconnecter
            </Button>
          </div>
        </div>

        <!-- État 3 : profil chargé -->
        <div v-else-if="auth.profile" class="animate-fade-up">
          <p class="mb-3 text-sm font-medium tracking-wide text-primary">
            Mon compte
          </p>
          <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Bonjour {{ auth.profile.first_name }}
          </h1>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            Voici les informations liées à ton profil sportif.
          </p>

          <dl class="mt-8 grid gap-3 sm:grid-cols-2">
            <div
              v-for="field in fields"
              :key="field.label"
              class="rounded-2xl border border-border/70 bg-card/70 px-4 py-4 shadow-sm"
            >
              <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {{ field.label }}
              </dt>
              <dd class="mt-1 text-base font-medium text-foreground">
                {{ field.value }}
              </dd>
            </div>
          </dl>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as-child variant="outline" size="lg" class="h-11 rounded-2xl">
              <NuxtLink to="/recipes">Voir mes recettes</NuxtLink>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              class="h-11 rounded-2xl text-muted-foreground hover:text-foreground"
              @click="logout()"
            >
              Se déconnecter
            </Button>
          </div>

          <div class="mt-14">
            <h2 class="font-serif text-2xl font-medium text-foreground">
              Mes repas enregistrés
            </h2>

            <!-- chargement -->
            <p
              v-if="favorites.status === 'idle' || favorites.status === 'loading'"
              class="mt-3 text-sm text-muted-foreground"
            >
              Chargement…
            </p>

            <!-- erreur -->
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

            <!-- chargé -->
            <template v-else>
              <p v-if="!favorites.items.length" class="mt-3 text-sm text-muted-foreground">
                Aucun repas enregistré pour l’instant. Va sur « Mon repas du soir » pour en ajouter.
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
        </div>

        <template #fallback>
          <p class="text-sm text-muted-foreground">Chargement…</p>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Mon compte — SportMeal' })

const auth = useAuthStore()
const favorites = useFavoritesStore()
const logout = useLogout()

const removeError = ref('')

onMounted(() => favorites.load())

async function onRemove(recipeId: string) {
  removeError.value = ''
  try {
    await favorites.remove(recipeId)
  }
  catch (error) {
    removeError.value = error instanceof Error ? error.message : 'Suppression impossible.'
  }
}

const fields = computed(() => {
  const p = auth.profile
  if (!p) return []
  return [
    { label: 'Prénom', value: p.first_name || '—' },
    { label: 'Adresse e-mail', value: p.email || auth.user?.email || '—' },
    { label: 'Sport pratiqué', value: p.sport || '—' },
    { label: 'Niveau', value: p.level || '—' },
    { label: 'Objectif', value: p.objectif || '—' },
    { label: 'Fréquence par semaine', value: p.frequence || '—' },
  ]
})
</script>
