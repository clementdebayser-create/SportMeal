<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
    <button
      v-for="option in options"
      :key="option"
      type="button"
      class="rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors"
      :class="modelValue === option
        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
        : 'border-input bg-card/60 text-muted-foreground hover:text-foreground'"
      @click="emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  options: readonly string[]
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
