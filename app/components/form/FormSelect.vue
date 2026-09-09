<template>
  <select
    :value="modelValue"
    class="flex h-11 w-full rounded-xl border border-input bg-card/60 px-3.5 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="neutralLabel" value="">{{ neutralLabel }}</option>
    <option v-else-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option v-for="option in normalizedOptions" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Option = { value: string, label: string }

const props = defineProps<{
  modelValue: string
  options: readonly string[] | readonly Option[]
  /** Option vide *sélectionnable* (filtre optionnel, ex: « Peu importe »). */
  neutralLabel?: string
  /** Option vide *désactivée* (choix obligatoire). Ignorée si `neutralLabel` est fourni. */
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const normalizedOptions = computed<Option[]>(() =>
  props.options.map(option =>
    typeof option === 'string' ? { value: option, label: option } : option,
  ),
)
</script>
