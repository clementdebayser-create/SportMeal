<template>
  <section id="comment-ca-marche" class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
    <LandingReveal>
      <p class="text-sm font-medium tracking-wide text-primary">Simple, en trois temps</p>
      <h2 class="mt-3 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Comment ça marche ?
      </h2>
      <p class="mt-3 max-w-2xl text-base text-muted-foreground">
        Tu indiques qui tu es. SportMeal s’occupe d’aligner tes assiettes
        avec ta pratique et tes envies.
      </p>
    </LandingReveal>

    <ol class="mt-12 grid gap-5 md:grid-cols-3">
      <li v-for="(step, index) in STEPS" :key="step.title">
        <LandingReveal :delay="index * 90">
          <article class="h-full rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <span class="font-serif text-3xl font-medium text-primary/70">
              {{ String(index + 1).padStart(2, '0') }}
            </span>
            <h3 class="mt-4 text-lg font-semibold text-foreground">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
              {{ step.description }}
            </p>
          </article>
        </LandingReveal>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { STEPS } from '~/constants/landing'
</script>
