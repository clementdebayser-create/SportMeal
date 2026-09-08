<template>
  <ClientOnly>
    <template v-if="auth.isAuthenticated">
      <Button
        as-child
        variant="ghost"
        class="rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <NuxtLink to="/account">
          Bonjour {{ auth.user?.name }}
        </NuxtLink>
      </Button>
      <Button
        variant="ghost"
        class="hidden rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
        @click="auth.logout()"
      >
        Se déconnecter
      </Button>
    </template>
    <template v-else>
      <Button
        as-child
        variant="ghost"
        class="hidden rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
      >
        <NuxtLink to="/login">Se connecter</NuxtLink>
      </Button>
      <Button as-child class="rounded-xl px-5 text-sm font-medium shadow-sm">
        <NuxtLink to="/register">Créer un compte</NuxtLink>
      </Button>
    </template>
    <template #fallback>
      <Button as-child class="rounded-xl px-5 text-sm font-medium shadow-sm">
        <NuxtLink to="/register">Créer un compte</NuxtLink>
      </Button>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const auth = useAuthStore()
</script>
