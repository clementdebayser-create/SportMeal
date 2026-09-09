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

    <h3
      class="font-serif font-medium text-foreground"
      :class="compact ? 'text-lg' : 'text-2xl'"
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

    <p class="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
      <span class="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
      {{ macros }}
    </p>

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

const totalTime = computed(() => {
  const total = (props.recipe.prep_time_minutes ?? 0) + (props.recipe.cook_time_minutes ?? 0)
  return total > 0 ? `${total} min` : '—'
})

const stats = computed(() => [
  { label: 'Temps total', value: totalTime.value },
  { label: 'Difficulté', value: props.recipe.difficulty ?? '—' },
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
</script>
