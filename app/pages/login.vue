<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-md flex-col justify-center px-6 py-16">
      <div class="animate-fade-up">
        <p class="mb-3 text-sm font-medium tracking-wide text-primary">
          Ravi de te revoir
        </p>
        <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Se connecter
        </h1>
        <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
          Accède à ton profil et à tes recettes adaptées.
        </p>
      </div>

      <div class="animate-fade-up mt-8 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8" style="animation-delay: 100ms">
        <form class="flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
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
              autocomplete="current-password"
              placeholder="••••••••"
              :aria-invalid="!!errors.password"
            />
          </FormField>

          <p v-if="submitError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {{ submitError }}
          </p>

          <Button type="submit" size="lg" class="h-12 rounded-2xl text-base shadow-sm" :disabled="submitting">
            {{ submitting ? 'Connexion…' : 'Se connecter' }}
          </Button>
        </form>

        <p class="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?
          <NuxtLink to="/register" class="font-medium text-primary underline-offset-4 hover:underline">
            Créer un compte
          </NuxtLink>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { email, required } from '~/lib/validators'

useHead({ title: 'Se connecter — SportMeal' })

const auth = useAuthStore()
const route = useRoute()

const { values, errors, submitting, submitError, handleSubmit } = useForm(
  { email: '', password: '' },
  {
    email: [required('Renseigne ton adresse e-mail.'), email()],
    password: [required('Renseigne ton mot de passe.')],
  },
)

function onSubmit() {
  return handleSubmit(async (v) => {
    await auth.login(v)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/account'
    await navigateTo(redirect)
  })
}
</script>
