<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-3xl px-6 py-16">
      <ClientOnly>
        <!-- Déconnecté : la redirection vers /login est en cours -->
        <p v-if="!auth.isAuthenticated" class="text-sm text-muted-foreground">
          Redirection…
        </p>

        <!-- État 1 : chargement du profil -->
        <p
          v-else-if="!auth.ready || auth.profileStatus === 'idle' || auth.profileStatus === 'loading'"
          class="text-sm text-muted-foreground"
        >
          Chargement…
        </p>

        <!-- État 2 : erreur de chargement du profil -->
        <div v-else-if="auth.profileStatus === 'error'" class="animate-fade-up">
          <p class="mb-3 text-sm font-medium tracking-wide text-primary">
            Mon compte
          </p>
          <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Profil indisponible
          </h1>
          <p class="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {{ auth.profileError || 'Impossible de charger ton profil.' }}
          </p>
          <div class="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              size="lg"
              class="h-11 rounded-2xl"
              :disabled="auth.profileStatus === 'loading'"
              @click="auth.retryProfile()"
            >
              Réessayer
            </Button>
            <Button
              variant="ghost"
              size="lg"
              class="h-11 rounded-2xl text-muted-foreground hover:text-foreground"
              @click="logout()"
            >
              Se déconnecter
            </Button>
          </div>
        </div>

        <!-- État 3 : profil chargé -->
        <div v-else-if="auth.profile" class="animate-fade-up">
          <p class="mb-3 text-sm font-medium tracking-wide text-primary">
            Mon compte
          </p>
          <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Bonjour {{ auth.profile.first_name }}
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Voici les informations liées à ton profil sportif. Tu peux tout modifier
            à tout moment, rien n'est figé.
          </p>

          <p
            v-if="savedMessage"
            class="mt-4 rounded-2xl bg-accent/60 px-4 py-3 text-sm text-foreground"
          >
            {{ savedMessage }}
          </p>

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

          <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button as-child variant="outline" size="lg" class="h-11 rounded-2xl">
              <NuxtLink to="/recipes">Voir mes recettes</NuxtLink>
            </Button>
            <Button
              variant="outline"
              size="lg"
              class="h-11 rounded-2xl"
              @click="editOpen = true"
            >
              Modifier le profil
            </Button>
            <Button
              variant="outline"
              size="lg"
              class="h-11 rounded-2xl"
              @click="pwOpen = true"
            >
              Changer le mot de passe
            </Button>
            <Button
              variant="ghost"
              size="lg"
              class="h-11 rounded-2xl text-muted-foreground hover:text-foreground"
              @click="logout()"
            >
              Se déconnecter
            </Button>
          </div>

          <AccountEditDialog v-model:open="editOpen" @saved="onSaved" />
          <AccountPasswordDialog v-model:open="pwOpen" @saved="onSaved" />
        </div>

        <template #fallback>
          <p class="text-sm text-muted-foreground">Chargement…</p>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SEXES } from '~/constants/profile'
import { joinLabels, joinNames, objectifLabel } from '~/utils/profileFormat'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Mon compte — SportMeal' })

const auth = useAuthStore()
const logout = useLogout()

const editOpen = ref(false)
const pwOpen = ref(false)
const savedMessage = ref('')

watch([editOpen, pwOpen], ([edit, pw]) => {
  if (edit || pw) savedMessage.value = ''
})

function onSaved(message: string) {
  savedMessage.value = message
}

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
