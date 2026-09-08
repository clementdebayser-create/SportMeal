<template>
  <article
    class="group h-full rounded-2xl border border-border/80 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
  >
    <div
      class="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent text-primary transition-transform duration-300 group-hover:scale-[1.04]"
      aria-hidden="true"
    >
      <slot name="icon" />
    </div>
    <h3 class="text-base font-semibold tracking-tight text-foreground">
      {{ title }}
    </h3>
    <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
      {{ description }}
    </p>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>
