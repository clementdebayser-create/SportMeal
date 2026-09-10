<template>
  <div v-if="auth.profile" class="animate-fade-up">
    <p class="mb-3 text-sm font-medium tracking-wide text-primary">
      Mon profil
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

    <AccountInfoSections />

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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
</script>
