<template>
  <section class="border-y border-border/70 bg-muted/40">
    <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <LandingReveal>
        <p class="text-sm font-medium tracking-wide text-primary">Ce que ça change</p>
        <h2 class="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Des recettes qui te ressemblent vraiment
        </h2>
        <p class="mt-3 max-w-2xl text-base text-muted-foreground">
          Moins de conjectures, plus de clarté : chaque suggestion tient compte
          de ta pratique, tes objectifs et ce que tu aimes manger.
        </p>
      </LandingReveal>

      <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        <LandingReveal
          v-for="(feature, index) in FEATURES"
          :key="feature.title"
          :class="feature.span"
          :delay="index * 70"
        >
          <LandingFeatureCard :title="feature.title" :description="feature.description">
            <template #icon>
              <component :is="feature.icon" class="size-5" />
            </template>
          </LandingFeatureCard>
        </LandingReveal>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FEATURES } from '~/constants/landing'
</script>
