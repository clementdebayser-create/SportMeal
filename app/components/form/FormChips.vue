<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :disabled="disabledValues?.includes(option.value)"
      class="rounded-full border px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      :class="modelValue.includes(option.value)
        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
        : 'border-input bg-card/60 text-muted-foreground hover:text-foreground'"
      :aria-pressed="modelValue.includes(option.value)"
      @click="toggle(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
type ChipOption = { value: string, label: string }

const props = defineProps<{
  modelValue: string[]
  options: readonly ChipOption[]
  /** Valeurs rendues non sélectionnables (ex: déjà choisies dans une autre liste). */
  disabledValues?: readonly string[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

function toggle(value: string) {
  emit(
    'update:modelValue',
    props.modelValue.includes(value)
      ? props.modelValue.filter(v => v !== value)
      : [...props.modelValue, value],
  )
}
</script>
