<template>
  <div>
    <p
      v-if="favorites.status === 'idle' || favorites.status === 'loading'"
      class="text-sm text-muted-foreground"
    >
      Chargement…
    </p>

    <div v-else-if="favorites.status === 'error'">
      <p class="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {{ favorites.error || 'Impossible de charger tes repas enregistrés.' }}
      </p>
      <Button
        variant="outline"
        size="lg"
        class="mt-3 h-11 rounded-2xl"
        @click="favorites.retry()"
      >
        Réessayer
      </Button>
    </div>

    <template v-else>
      <p v-if="!favorites.items.length" class="text-sm text-muted-foreground">
        Aucun repas enregistré pour l’instant. Lance une recherche pour en ajouter.
      </p>
      <div v-else class="grid gap-4 sm:grid-cols-2">
        <RecipeCard
          v-for="recipe in favorites.items"
          :key="recipe.id"
          :recipe="recipe"
          compact
        >
          <template #actions>
            <Button
              variant="ghost"
              class="h-9 rounded-xl px-3 text-sm text-muted-foreground hover:text-foreground"
              @click="onRemove(recipe.id)"
            >
              Retirer
            </Button>
          </template>
        </RecipeCard>
      </div>
      <p v-if="removeError" class="mt-3 text-sm text-destructive">{{ removeError }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const favorites = useFavoritesStore()

const removeError = ref('')
async function onRemove(recipeId: string) {
  removeError.value = ''
  try {
    await favorites.remove(recipeId)
  }
  catch (error) {
    removeError.value = error instanceof Error ? error.message : 'Suppression impossible.'
  }
}
</script>
