<template>
  <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
    <LandingReveal>
      <div class="rounded-3xl border border-border/80 bg-primary px-6 py-12 text-primary-foreground shadow-sm sm:px-12 sm:py-14">
        <h2 class="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Prêt à manger selon ton sport ?
        </h2>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
          Crée ton profil en quelques minutes et reçois des recettes alignées
          avec ta pratique, tes objectifs et tes goûts.
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <ClientOnly>
            <Button
              as-child
              size="lg"
              class="h-11 rounded-xl bg-background px-6 text-base text-foreground shadow-sm hover:bg-background/90"
            >
              <NuxtLink :to="auth.isAuthenticated ? '/account' : '/register'">
                {{ auth.isAuthenticated ? 'Mon profil' : 'Créer un compte' }}
              </NuxtLink>
            </Button>
            <template #fallback>
              <Button
                as-child
                size="lg"
                class="h-11 rounded-xl bg-background px-6 text-base text-foreground shadow-sm hover:bg-background/90"
              >
                <NuxtLink to="/register">Créer un compte</NuxtLink>
              </Button>
            </template>
          </ClientOnly>
          <Button
            as-child
            variant="ghost"
            size="lg"
            class="h-11 rounded-xl px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <NuxtLink to="/recipes">Voir les recettes</NuxtLink>
          </Button>
        </div>
      </div>
    </LandingReveal>
  </section>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
