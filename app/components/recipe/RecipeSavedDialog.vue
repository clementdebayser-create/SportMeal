<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-overlay-in"
      />
      <div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogContent
          class="pointer-events-auto max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border/70 bg-card p-6 shadow-lg data-[state=open]:animate-dialog-in sm:p-8"
        >
          <DialogTitle class="font-serif text-2xl font-medium text-foreground">
            Mes repas enregistrés
          </DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            Les repas que tu as gardés. Retire ceux qui ne t'intéressent plus.
          </DialogDescription>

          <div class="mt-6">
            <RecipeSavedList />
          </div>

          <div class="mt-6 flex justify-end">
            <DialogClose as-child>
              <Button type="button" variant="ghost" class="h-11 rounded-2xl">
                Fermer
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

const open = defineModel<boolean>('open', { default: false })
</script>
