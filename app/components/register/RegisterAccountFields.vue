<template>
  <FormField label="Prénom" html-for="name" :error="errors.name">
    <Input id="name" v-model="values.name" type="text" autocomplete="given-name" placeholder="Alex" :aria-invalid="!!errors.name" />
  </FormField>
  <FormField label="Adresse e-mail" html-for="email" :error="errors.email">
    <Input id="email" v-model="values.email" type="email" autocomplete="email" placeholder="toi@exemple.com" :aria-invalid="!!errors.email" />
  </FormField>
  <FormField label="Mot de passe" html-for="password" :error="errors.password">
    <Input id="password" v-model="values.password" type="password" autocomplete="new-password" placeholder="8 caractères minimum" :aria-invalid="!!errors.password" />
  </FormField>
  <FormField label="Sport pratiqué" html-for="sport" :error="errors.sport">
    <FormSelect id="sport" v-model="values.sport" :options="SPORTS" placeholder="Choisis ton sport…" :aria-invalid="!!errors.sport" />
  </FormField>
  <FormField label="Niveau" html-for="level" :error="errors.level">
    <FormSelect id="level" v-model="values.level" :options="LEVELS" neutral-label="Non renseigné" />
  </FormField>
  <FormField label="Objectif" html-for="objectif" :error="errors.objectif">
    <FormSelect id="objectif" v-model="values.objectif" :options="OBJECTIVES" neutral-label="Non renseigné" />
  </FormField>
  <FormField label="Fréquence par semaine" :error="errors.frequency">
    <FormSegmentedControl v-model="values.frequency" :options="TRAINING_FREQUENCIES" />
  </FormField>
</template>

<script setup lang="ts">
import { LEVELS, OBJECTIVES, SPORTS, TRAINING_FREQUENCIES } from '~/constants/profile'
import type { RegisterFormErrors, RegisterFormValues } from '~/types/register'

defineProps<{
  values: RegisterFormValues
  errors: RegisterFormErrors
}>()
</script>
