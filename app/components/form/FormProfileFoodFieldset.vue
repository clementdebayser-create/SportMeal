<template>
  <fieldset class="flex flex-col gap-4">
    <legend class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      Alimentation
    </legend>

    <p v-if="error" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
      Impossible de charger les options alimentaires. Réessaie plus tard.
    </p>
    <div v-else class="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      <FormField label="Régime alimentaire">
        <FormChips v-model="regime" :options="regimeOptions" />
      </FormField>
      <FormField label="Allergies / intolérances">
        <FormChips v-model="allergene" :options="allergeneOptions" />
      </FormField>
      <FormField class="sm:col-span-2 lg:col-span-1" label="Ingrédients que tu n'aimes pas">
        <FormSearchMultiSelect
          v-model="disliked"
          :options="ingredientOptions"
          placeholder="Rechercher un ingrédient…"
          empty-text="Aucun ingrédient trouvé."
        />
      </FormField>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
const regime = defineModel<string[]>('regime', { default: () => [] })
const allergene = defineModel<string[]>('allergene', { default: () => [] })
const disliked = defineModel<string[]>('disliked', { default: () => [] })

const { error, regimeOptions, allergeneOptions, ingredientOptions } = useFoodOptions()
</script>
