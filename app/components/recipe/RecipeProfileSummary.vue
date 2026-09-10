<template>
  <ClientOnly>
    <div
      v-if="auth.isAuthenticated && auth.profile"
      class="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm"
    >
      <h2 class="font-serif text-lg font-medium text-foreground">
        Mon profil
      </h2>
      <p class="mt-1 text-xs text-muted-foreground">
        Les suggestions s'y adaptent automatiquement.
      </p>

      <dl class="mt-4 space-y-3">
        <div v-for="item in profileRecap" :key="item.label">
          <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {{ item.label }}
          </dt>
          <dd class="mt-0.5 text-sm font-medium text-foreground break-words">
            {{ item.value }}
          </dd>
        </div>
      </dl>

      <Button
        variant="outline"
        class="mt-5 h-10 w-full rounded-xl"
        @click="emit('edit')"
      >
        Modifier le profil
      </Button>
      <Button
        variant="outline"
        class="mt-2 h-10 w-full rounded-xl"
        @click="emit('open-saved')"
      >
        Mes repas enregistrés
      </Button>
      <p v-if="savedMessage" class="mt-2 text-xs text-muted-foreground">
        {{ savedMessage }}
      </p>
    </div>

    <div
      v-else
      class="rounded-3xl border border-border/70 bg-card/70 p-5 shadow-sm"
    >
      <h2 class="font-serif text-lg font-medium text-foreground">
        Personnalise tes suggestions
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Connecte-toi pour filtrer automatiquement les repas selon ton régime,
        tes allergies et les ingrédients que tu évites.
      </p>
      <Button as-child variant="outline" class="mt-4 h-10 w-full rounded-xl">
        <NuxtLink :to="loginLink">Se connecter</NuxtLink>
      </Button>
    </div>

    <template #fallback>
      <div class="h-56 rounded-3xl border border-border/70 bg-card/40" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { joinLabels, joinNames, objectifLabel } from '~/utils/profileFormat'

defineProps<{ loginLink: string, savedMessage?: string }>()
const emit = defineEmits<{ 'edit': [], 'open-saved': [] }>()

const auth = useAuthStore()

/* Récap du profil affiché à gauche. */
const profileRecap = computed(() => [
  { label: 'Objectif', value: objectifLabel(auth.profile?.objectif) },
  { label: 'Régime alimentaire', value: joinLabels(auth.profileDietary?.regime) },
  { label: 'Allergies / intolérances', value: joinLabels(auth.profileDietary?.allergene) },
  { label: 'Ingrédients évités', value: joinNames(auth.profileTastes?.disliked) },
])
</script>
