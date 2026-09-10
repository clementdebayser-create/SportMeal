<template>
  <p class="text-sm text-muted-foreground">
    Facultatif — utile plus tard pour affiner tes portions. Tu peux passer.
  </p>
  <FormField label="Âge" html-for="age" :error="errors.age">
    <Input id="age" v-model="values.age" type="number" inputmode="numeric" min="10" max="120" placeholder="ex : 28" :aria-invalid="!!errors.age" />
  </FormField>
  <FormField label="Sexe" html-for="sexe" :error="errors.sexe">
    <FormSelect id="sexe" v-model="values.sexe" :options="SEXES" neutral-label="Non renseigné" />
  </FormField>
  <FormField label="Poids (kg)" html-for="poids" :error="errors.poids">
    <Input id="poids" v-model="values.poids" type="number" inputmode="decimal" min="20" max="400" step="0.1" placeholder="ex : 72" :aria-invalid="!!errors.poids" />
  </FormField>
  <FormField label="Taille (cm)" html-for="taille" :error="errors.taille">
    <Input id="taille" v-model="values.taille" type="number" inputmode="numeric" min="100" max="250" placeholder="ex : 178" :aria-invalid="!!errors.taille" />
  </FormField>
</template>

<script setup lang="ts">
import { SEXES } from '~/constants/profile'
import type { RegisterFormErrors, RegisterFormValues } from '~/types/register'

defineProps<{
  values: RegisterFormValues
  errors: RegisterFormErrors
}>()
</script>
