<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md flex-col justify-center px-6 py-16">
      <div class="animate-fade-up">
        <p class="mb-3 text-sm font-medium tracking-wide text-primary">
          Commence maintenant
        </p>
        <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Créer un compte
        </h1>
        <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
          Renseigne ton profil pour recevoir des recettes adaptées à ton sport,
          ton niveau, ton objectif et tes goûts.
        </p>
      </div>

      <div class="animate-fade-up mt-8 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8" style="animation-delay: 100ms">
        <form class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
          <FormField label="Prénom" html-for="name" :error="errors.name">
            <Input
              id="name"
              v-model="values.name"
              type="text"
              autocomplete="given-name"
              placeholder="Alex"
              :aria-invalid="!!errors.name"
            />
          </FormField>

          <FormField label="Adresse e-mail" html-for="email" :error="errors.email">
            <Input
              id="email"
              v-model="values.email"
              type="email"
              autocomplete="email"
              placeholder="toi@exemple.com"
              :aria-invalid="!!errors.email"
            />
          </FormField>

          <FormField label="Mot de passe" html-for="password" :error="errors.password">
            <Input
              id="password"
              v-model="values.password"
              type="password"
              autocomplete="new-password"
              placeholder="8 caractères minimum"
              :aria-invalid="!!errors.password"
            />
          </FormField>

          <FormField label="Sport pratiqué" html-for="sport" :error="errors.sport">
            <FormSelect
              id="sport"
              v-model="values.sport"
              :options="SPORTS"
              placeholder="Choisis ton sport…"
              :aria-invalid="!!errors.sport"
            />
          </FormField>

          <FormField label="Fréquence par semaine" :error="errors.frequency">
            <FormSegmentedControl v-model="values.frequency" :options="TRAINING_FREQUENCIES" />
          </FormField>

          <p v-if="submitError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {{ submitError }}
          </p>

          <Button type="submit" size="lg" class="h-12 rounded-2xl text-base shadow-sm" :disabled="submitting">
            {{ submitting ? 'Création…' : 'Créer mon compte' }}
          </Button>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Tu as déjà un compte ?
          <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
            Se connecter
          </NuxtLink>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { SPORTS, TRAINING_FREQUENCIES } from '~/constants/profile'
import { email, minLength, required } from '~/lib/validators'
import type { RegisterPayload } from '~/types/auth'

useHead({ title: 'Créer un compte — SportMeal' })

const auth = useAuthStore()

const { values, errors, submitting, submitError, handleSubmit } = useForm(
  { name: '', email: '', password: '', sport: '', frequency: '' },
  {
    name: [required('Renseigne ton prénom.'), minLength(2, 'Prénom trop court.')],
    email: [required('Renseigne ton adresse e-mail.'), email()],
    password: [required('Choisis un mot de passe.'), minLength(8, '8 caractères minimum.')],
    sport: [required('Sélectionne ton sport.')],
    frequency: [required('Indique ta fréquence hebdomadaire.')],
  },
)

function onSubmit() {
  return handleSubmit(async (v) => {
    // Champs garantis non vides par la validation ci-dessus.
    const { needsEmailConfirmation } = await auth.register(v as RegisterPayload)
    if (needsEmailConfirmation) {
      submitError.value = 'Compte créé. Confirme ton adresse e-mail via le lien reçu, puis connecte-toi.'
      return
    }
    await navigateTo('/account')
  })
}
</script>
