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

        <!-- Chargement du profil -->
        <p
          v-else-if="!auth.ready || auth.profileStatus === 'idle' || auth.profileStatus === 'loading'"
          class="text-sm text-muted-foreground"
        >
          Chargement…
        </p>

        <!-- Erreur de chargement -->
        <AccountProfileError v-else-if="auth.profileStatus === 'error'" />

        <!-- Profil chargé -->
        <AccountProfileView v-else-if="auth.profile" />

        <template #fallback>
          <p class="text-sm text-muted-foreground">Chargement…</p>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

useHead({ title: 'Mon profil — SportMeal' })

const auth = useAuthStore()
</script>
