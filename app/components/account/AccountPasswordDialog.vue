<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-overlay-in"
      />
      <div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogContent
          class="pointer-events-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-border/70 bg-card p-6 shadow-lg data-[state=open]:animate-dialog-in sm:p-8"
        >
          <DialogTitle class="font-serif text-2xl font-medium text-foreground">
            Changer le mot de passe
          </DialogTitle>
          <DialogDescription class="mt-1 text-sm text-muted-foreground">
            Saisis ton mot de passe actuel puis le nouveau.
          </DialogDescription>

          <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
            <FormField
              label="Mot de passe actuel"
              html-for="pw-current"
              :error="errors.current"
            >
              <Input
                id="pw-current"
                v-model="values.current"
                type="password"
                autocomplete="current-password"
                :aria-invalid="!!errors.current"
              />
            </FormField>

            <FormField
              label="Nouveau mot de passe"
              html-for="pw-new"
              :error="errors.next"
            >
              <Input
                id="pw-new"
                v-model="values.next"
                type="password"
                autocomplete="new-password"
                placeholder="8 caractères minimum"
                :aria-invalid="!!errors.next"
              />
            </FormField>

            <FormField
              label="Confirmer le nouveau mot de passe"
              html-for="pw-confirm"
              :error="errors.confirm"
            >
              <Input
                id="pw-confirm"
                v-model="values.confirm"
                type="password"
                autocomplete="new-password"
                :aria-invalid="!!errors.confirm"
              />
            </FormField>

            <p
              v-if="submitError"
              class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
            >
              {{ submitError }}
            </p>

            <div class="mt-1 flex flex-col gap-3 sm:flex-row-reverse">
              <Button type="submit" class="h-11 rounded-2xl" :disabled="submitting">
                {{ submitting ? 'Enregistrement…' : 'Changer le mot de passe' }}
              </Button>
              <DialogClose as-child>
                <Button type="button" variant="ghost" class="h-11 rounded-2xl">
                  Annuler
                </Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import { minLength, required } from '~/utils/validators'

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [message: string] }>()

const { values, errors, submitError, submitting, handleSubmit, reset } = useForm(
  { current: '', next: '', confirm: '' },
  {
    current: [required('Saisis ton mot de passe actuel.')],
    next: [required('Choisis un nouveau mot de passe.'), minLength(8, '8 caractères minimum.')],
    confirm: [required('Confirme le nouveau mot de passe.')],
  },
)

watch(open, (isOpen) => {
  if (isOpen) reset()
})

function onSubmit() {
  return handleSubmit(async (v) => {
    if (v.next !== v.confirm) {
      errors.confirm = 'Les deux mots de passe ne correspondent pas.'
      return
    }

    await useAccountSettings().changePassword(v.current, v.next)

    reset()
    open.value = false
    emit('saved', 'Mot de passe mis à jour.')
  })
}
</script>
