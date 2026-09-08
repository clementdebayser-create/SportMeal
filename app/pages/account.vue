<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto w-full max-w-2xl px-6 py-16">
      <ClientOnly>
        <div v-if="auth.user" class="animate-fade-up">
          <p class="mb-3 text-sm font-medium tracking-wide text-primary">
            Mon compte
          </p>
          <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Bonjour {{ auth.user.name }}
          </h1>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            Voici les informations liées à ton profil sportif.
          </p>

          <dl class="mt-8 grid gap-3 sm:grid-cols-2">
            <div
              v-for="field in fields"
              :key="field.label"
              class="rounded-2xl border border-border/70 bg-card/70 px-4 py-4 shadow-sm"
            >
              <dt class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {{ field.label }}
              </dt>
              <dd class="mt-1 text-base font-medium text-foreground">
                {{ field.value }}
              </dd>
            </div>
          </dl>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button as-child variant="outline" size="lg" class="h-11 rounded-2xl">
              <NuxtLink to="/recipes">Voir mes recettes</NuxtLink>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              class="h-11 rounded-2xl text-muted-foreground hover:text-foreground"
              @click="onLogout"
            >
              Se déconnecter
            </Button>
          </div>
        </div>

        <template #fallback>
          <p class="text-sm text-muted-foreground">Chargement…</p>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ middleware: 'auth' })

useHead({ title: 'Mon compte — SportMeal' })

const auth = useAuthStore()

const fields = computed(() => {
  const user = auth.user
  if (!user) return []
  return [
    { label: 'Prénom', value: user.name },
    { label: 'Adresse e-mail', value: user.email },
    { label: 'Sport pratiqué', value: user.sport || '—' },
    { label: 'Fréquence par semaine', value: user.frequency || '—' },
  ]
})

async function onLogout() {
  auth.logout()
  await navigateTo('/')
}
</script>
