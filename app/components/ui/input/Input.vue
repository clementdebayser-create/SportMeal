<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

function onInput(event: Event) {
  emits('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    data-slot="input"
    :value="modelValue"
    :class="cn(
      'flex h-11 w-full min-w-0 rounded-xl border border-input bg-card/60 px-3.5 py-1 text-base shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm',
      props.class,
    )"
    @input="onInput"
  >
</template>
