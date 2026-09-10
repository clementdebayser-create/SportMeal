<template>
  <div class="mt-10 space-y-9">
    <section v-for="group in sections" :key="group.title">
      <h2 class="font-serif text-xl font-medium text-foreground">
        {{ group.title }}
      </h2>
      <dl class="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          v-for="field in group.items"
          :key="field.label"
          class="rounded-2xl border border-border/70 bg-card/70 px-4 py-4 shadow-sm"
          :class="field.wide ? 'sm:col-span-2' : ''"
        >
          <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {{ field.label }}
          </dt>
          <dd class="mt-1 text-base font-medium text-foreground break-words">
            {{ field.value }}
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SEXES } from '~/constants/profile'
import { joinLabels, joinNames, objectifLabel } from '~/utils/profileFormat'

const auth = useAuthStore()

function sexeLabel(value: string | null) {
  return SEXES.find(s => s.value === value)?.label ?? '—'
}

interface ProfileField {
  label: string
  value: string
  /** Occupe toute la largeur (valeurs longues : listes d'ingrédients…). */
  wide?: boolean
}

const sections = computed<{ title: string, items: ProfileField[] }[]>(() => {
  const p = auth.profile
  if (!p) return []
  return [
    {
      title: 'Profil sportif',
      items: [
        { label: 'Prénom', value: p.first_name || '—' },
        { label: 'Adresse e-mail', value: p.email || auth.user?.email || '—' },
        { label: 'Sport pratiqué', value: p.sport || '—' },
        { label: 'Niveau', value: p.level || '—' },
        { label: 'Objectif', value: objectifLabel(p.objectif) },
        { label: 'Fréquence par semaine', value: p.frequence || '—' },
      ],
    },
    {
      title: 'Données physiques',
      items: [
        { label: 'Âge', value: p.age != null ? `${p.age} ans` : '—' },
        { label: 'Sexe', value: sexeLabel(p.sexe) },
        { label: 'Poids', value: p.poids_kg != null ? `${p.poids_kg} kg` : '—' },
        { label: 'Taille', value: p.taille_cm != null ? `${p.taille_cm} cm` : '—' },
      ],
    },
    {
      title: 'Préférences alimentaires',
      items: [
        { label: 'Régime alimentaire', value: joinLabels(auth.profileDietary?.regime) },
        { label: 'Allergies / intolérances', value: joinLabels(auth.profileDietary?.allergene) },
        { label: 'Ingrédients évités', value: joinNames(auth.profileTastes?.disliked), wide: true },
      ],
    },
  ]
})
</script>
