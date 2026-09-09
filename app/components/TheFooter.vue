<template>
  <footer class="border-t border-border/70">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p class="font-serif text-lg font-semibold text-foreground">SportMeal</p>
        <p class="mt-1 max-w-sm text-sm text-muted-foreground">
          Des recettes pensées pour ton sport, ton niveau et tes goûts.
        </p>
      </div>
      <nav class="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Pied de page">
        <ClientOnly>
          <NuxtLink
            v-if="auth.isAuthenticated"
            class="text-muted-foreground transition-colors hover:text-foreground"
            to="/account"
          >
            Mon compte
          </NuxtLink>
          <template v-else>
            <NuxtLink class="text-muted-foreground transition-colors hover:text-foreground" to="/register">
              Créer un compte
            </NuxtLink>
            <NuxtLink class="text-muted-foreground transition-colors hover:text-foreground" to="/login">
              Se connecter
            </NuxtLink>
          </template>
          <template #fallback>
            <NuxtLink class="text-muted-foreground transition-colors hover:text-foreground" to="/register">
              Créer un compte
            </NuxtLink>
            <NuxtLink class="text-muted-foreground transition-colors hover:text-foreground" to="/login">
              Se connecter
            </NuxtLink>
          </template>
        </ClientOnly>
        <NuxtLink class="text-muted-foreground transition-colors hover:text-foreground" to="/recipes">
          Recettes
        </NuxtLink>
      </nav>
    </div>
    <div class="border-t border-border/60">
      <p class="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
        © {{ year }} SportMeal. Nutrition personnalisée pour sportifs.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const year = new Date().getFullYear()
</script>
