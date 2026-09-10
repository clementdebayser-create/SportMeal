<template>
  <div class="animate-fade-up">
    <p class="mb-3 text-sm font-medium tracking-wide text-primary">
      Mon profil
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
</template>

<script setup lang="ts">
const auth = useAuthStore()
const logout = useLogout()
</script>
