<template>
  <article
    class="rounded-3xl border border-border/80 bg-card/80 shadow-sm"
    :class="compact ? 'p-4' : 'p-5 sm:p-6'"
  >
    <img
      v-if="recipe.image_url"
      :src="recipe.image_url"
      :alt="recipe.title"
      class="mb-4 aspect-video w-full rounded-2xl object-cover"
    >

    <p
      v-if="!compact"
      class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
    >
      Repas proposé
    </p>
    <h3
      class="font-serif font-medium text-foreground"
      :class="compact ? 'text-lg' : 'mt-2 text-2xl'"
    >
      {{ recipe.title }}
    </h3>
    <p
      v-if="recipe.description"
      class="mt-2 text-sm text-muted-foreground"
      :class="{ 'line-clamp-2': compact }"
    >
      {{ recipe.description }}
    </p>

    <dl class="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-xl bg-muted/80 px-3 py-2.5"
      >
        <dt class="text-[11px] uppercase tracking-wide text-muted-foreground">
          {{ stat.label }}
        </dt>
        <dd class="mt-1 text-sm font-medium">{{ stat.value }}</dd>
      </div>
    </dl>

    <ul v-if="!compact" class="mt-4 space-y-1.5 text-sm text-muted-foreground">
      <li class="flex items-center gap-2">
        <span class="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        {{ macros }}
      </li>
      <li v-if="totalTime" class="flex items-center gap-2">
        <span class="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        {{ totalTime }} · {{ servingsLabel }}
      </li>
    </ul>

    <div v-if="$slots.actions" :class="compact ? 'mt-3' : 'mt-5'">
      <slot name="actions" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RecipeRow } from '~/types/recipe'

const props = defineProps<{
  recipe: RecipeRow
  compact?: boolean
}>()

const stats = computed(() => [
  { label: 'Difficulté', value: props.recipe.difficulty ?? '—' },
  {
    label: 'Prépa',
    value: props.recipe.prep_time_minutes != null ? `${props.recipe.prep_time_minutes} min` : '—',
  },
  {
    label: 'Calories',
    value: props.recipe.calories_kcal != null ? `${props.recipe.calories_kcal} kcal` : '—',
  },
])

const macros = computed(() => {
  const r = props.recipe
  const parts: string[] = []
  if (r.protein_g != null) parts.push(`${r.protein_g} g protéines`)
  if (r.carbs_g != null) parts.push(`${r.carbs_g} g glucides`)
  if (r.fat_g != null) parts.push(`${r.fat_g} g lipides`)
  return parts.join(' · ') || 'Macros non renseignées'
})

const totalTime = computed(() => {
  const r = props.recipe
  const total = (r.prep_time_minutes ?? 0) + (r.cook_time_minutes ?? 0)
  return total > 0 ? `${total} min au total` : ''
})

const servingsLabel = computed(() => {
  const n = props.recipe.servings ?? 1
  return `${n} portion${n > 1 ? 's' : ''}`
})
</script>
