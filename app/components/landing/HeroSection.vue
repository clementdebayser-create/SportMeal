
<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.9_0.05_145_/_0.55),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.93_0.04_85_/_0.5),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,oklch(0.32_0.05_150_/_0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.28_0.04_90_/_0.35),transparent_50%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-28">
      <div class="animate-fade-up">
        <p class="mb-4 text-sm font-medium tracking-wide text-primary">
          Nutrition sportive personnalisée
        </p>
        <h1 class="font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.75rem]">
          Mange selon ton sport.
          <span class="block text-primary">Progresse selon tes objectifs.</span>
        </h1>
        <p class="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          SportMeal adapte tes recettes à ta pratique sportive, à ton niveau,
          à ton objectif et à tes goûts — pour une assiette claire, savoureuse
          et vraiment utile.
        </p>
        <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ClientOnly>
            <Button as-child size="lg" class="h-12 rounded-2xl px-7 text-base shadow-sm">
              <NuxtLink :to="auth.isAuthenticated ? '/account' : '/register'">
                {{ auth.isAuthenticated ? 'Mon compte' : 'Créer mon profil' }}
              </NuxtLink>
            </Button>
            <template #fallback>
              <Button as-child size="lg" class="h-12 rounded-2xl px-7 text-base shadow-sm">
                <NuxtLink to="/register">Créer mon profil</NuxtLink>
              </Button>
            </template>
          </ClientOnly>
          <Button
            as-child
            variant="outline"
            size="lg"
            class="h-12 rounded-2xl px-7 text-base"
          >
            <NuxtLink to="/recipes">Découvrir les recettes</NuxtLink>
          </Button>
        </div>

        <ul class="mt-10 grid gap-3 sm:grid-cols-3">
          <li
            v-for="item in REASSURANCES"
            :key="item.label"
            class="flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card/70 px-3.5 py-3 text-sm font-medium text-foreground shadow-sm"
          >
            <span class="text-base" aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </li>
        </ul>
      </div>

      <div class="animate-fade-up relative" style="animation-delay: 120ms">
        <NuxtImg
          src="/HeroSection.png"
          alt="Assiette SportMeal adaptée à ta pratique sportive"
          class="h-[340px] w-full rounded-3xl object-cover shadow-xl ring-1 ring-border/60 sm:h-[440px] lg:h-[620px]"
          sizes="(max-width: 1024px) 100vw, 620px"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { REASSURANCES } from '~/constants/landing'

const auth = useAuthStore()
</script>
