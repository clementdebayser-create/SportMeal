<template>
  <!-- Étape 3 : régime alimentaire (optionnel) -->
  <template v-if="step === 3">
    <p class="text-sm text-muted-foreground">
      Sélectionne ce qui s’applique. Facultatif.
    </p>
    <p v-if="optionsError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
      {{ optionsError }} Tu pourras le renseigner plus tard.
    </p>
    <FormChips v-else v-model="regime" :options="regimeOptions" />
  </template>

  <!-- Étape 4 : allergies / intolérances (optionnel) -->
  <template v-else-if="step === 4">
    <p class="rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm text-muted-foreground">
      ⚠️ Les recettes contenant ces ingrédients seront exclues de tes suggestions.
    </p>
    <p v-if="optionsError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
      {{ optionsError }} Tu pourras le renseigner plus tard.
    </p>
    <FormChips v-else v-model="allergene" :options="allergeneOptions" />
  </template>

  <!-- Étape 5 : aversions (facultatif) -->
  <template v-else>
    <p class="text-sm text-muted-foreground">
      Facultatif — recherche un ingrédient et ajoute-le à la liste.
    </p>
    <p v-if="optionsError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
      {{ optionsError }} Tu pourras le renseigner plus tard.
    </p>
    <div v-else>
      <p class="mb-2 text-sm font-medium text-foreground">Ingrédients que tu n’aimes pas</p>
      <FormSearchMultiSelect
        v-model="disliked"
        :options="ingredientOptions"
        placeholder="Rechercher un ingrédient…"
        empty-text="Aucun ingrédient trouvé."
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import type { ChipOption } from '~/composables/useFoodOptions'

defineProps<{
  step: number
  optionsError: string
  regimeOptions: ChipOption[]
  allergeneOptions: ChipOption[]
  ingredientOptions: ChipOption[]
}>()

const regime = defineModel<string[]>('regime', { default: () => [] })
const allergene = defineModel<string[]>('allergene', { default: () => [] })
const disliked = defineModel<string[]>('disliked', { default: () => [] })
</script>
