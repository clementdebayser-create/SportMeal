<template>
  <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
    <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
      Recettes
    </h1>
    <p class="mt-3 max-w-2xl text-base text-muted-foreground">
      Le catalogue personnalisé arrive bientôt. Crée ton profil pour recevoir
      des recettes adaptées à ton sport, ton niveau, ton objectif et tes goûts.
    </p>
    <div class="mt-8">
      <Button as-child class="h-11 rounded-xl px-6">
        <NuxtLink to="/register">Créer mon profil</NuxtLink>
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({
  title: 'Recettes — SportMeal',
})
</script>
