<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.9_0.05_145_/_0.5),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.32_0.05_150_/_0.4),transparent_60%)]"
      aria-hidden="true"
    />

    <div class="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg flex-col justify-center px-6 py-16">
      <div class="animate-fade-up">
        <p class="mb-3 text-sm font-medium tracking-wide text-primary">
          Commence maintenant
        </p>
        <h1 class="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Créer un compte
        </h1>
        <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
          {{ currentStep.hint }}
        </p>
      </div>

      <div
        class="animate-fade-up mt-8 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-sm sm:p-8"
        style="animation-delay: 100ms"
      >
        <!-- Compte créé, mais certaines préférences n'ont pas pu être enregistrées -->
        <div v-if="partialWarning" class="flex flex-col gap-4">
          <h2 class="font-serif text-2xl font-medium text-foreground">
            Ton compte est créé
          </h2>
          <p class="rounded-xl bg-accent/60 px-3.5 py-2.5 text-sm text-foreground">
            En revanche, {{ partialWarning.join(' et ') }} n’ont pas pu être enregistrés.
            Tu pourras les renseigner plus tard depuis ton compte.
          </p>
          <Button size="lg" class="h-12 rounded-2xl" @click="navigateTo('/account')">
            Aller à mon profil
          </Button>
        </div>

        <template v-else>
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Étape {{ step }} / {{ STEP_COUNT }} · {{ currentStep.title }}
          </p>
          <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary transition-all"
              :style="{ width: `${(step / STEP_COUNT) * 100}%` }"
            />
          </div>

          <form class="mt-6 flex flex-col gap-5" novalidate @submit.prevent="onSubmit">
            <RegisterAccountFields v-if="step === 1" :values="values" :errors="errors" />
            <RegisterPhysicalFields v-else-if="step === 2" :values="values" :errors="errors" />
            <RegisterDietStep
              v-else
              :step="step"
              :options-error="optionsError"
              :regime-options="regimeChipOptions"
              :allergene-options="allergeneChipOptions"
              :ingredient-options="ingredientChipOptions"
              v-model:regime="regimeSelection"
              v-model:allergene="allergeneSelection"
              v-model:disliked="dislikedIngredients"
            />

            <p v-if="submitError" class="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {{ submitError }}
            </p>

            <div class="mt-1 flex items-center gap-3">
              <Button v-if="step > 1" type="button" variant="ghost" class="h-11 rounded-2xl" @click="goPrev">
                Précédent
              </Button>
              <div class="flex-1" />
              <Button
                v-if="step > 1 && step < STEP_COUNT"
                type="submit"
                variant="ghost"
                class="h-11 rounded-2xl text-muted-foreground hover:text-foreground"
                :disabled="submitting"
              >
                Créer un compte
              </Button>
              <Button v-if="step < STEP_COUNT" type="button" class="h-11 rounded-2xl px-6" @click="goNext">
                Suivant
              </Button>
              <Button v-else type="submit" size="lg" class="h-11 rounded-2xl px-6" :disabled="submitting">
                {{ submitting ? 'Création…' : 'Créer un compte' }}
              </Button>
            </div>
          </form>

          <p class="mt-6 text-center text-sm text-muted-foreground">
            Tu as déjà un compte ?
            <NuxtLink to="/login" class="font-medium text-primary underline-offset-4 hover:underline">
              Se connecter
            </NuxtLink>
          </p>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
useHead({ title: 'Créer un compte — SportMeal' })

const {
  STEP_COUNT,
  step,
  currentStep,
  partialWarning,
  values,
  errors,
  submitting,
  submitError,
  regimeSelection,
  allergeneSelection,
  dislikedIngredients,
  optionsError,
  regimeChipOptions,
  allergeneChipOptions,
  ingredientChipOptions,
  goPrev,
  goNext,
  onSubmit,
} = useRegisterWizard()
</script>
