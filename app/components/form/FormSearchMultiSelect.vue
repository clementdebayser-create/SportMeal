<template>
  <div>
    <Input
      v-model="query"
      type="text"
      :placeholder="placeholder"
      autocomplete="off"
    />

    <ul
      v-if="query.trim() && filtered.length"
      class="mt-2 max-h-52 overflow-y-auto rounded-xl border border-border/70 bg-card shadow-sm"
    >
      <li v-for="option in filtered" :key="option.value">
        <button
          type="button"
          class="flex w-full items-center px-3.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent"
          @click="add(option.value)"
        >
          {{ option.label }}
        </button>
      </li>
    </ul>
    <p
      v-else-if="query.trim() && !filtered.length"
      class="mt-2 text-sm text-muted-foreground"
    >
      {{ emptyText }}
    </p>

    <div v-if="selectedOptions.length" class="mt-3 flex flex-wrap gap-2">
      <span
        v-for="option in selectedOptions"
        :key="option.value"
        class="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary py-1.5 pl-3.5 pr-2 text-sm font-medium text-primary-foreground"
      >
        {{ option.label }}
        <button
          type="button"
          class="grid size-4 place-items-center rounded-full text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          :aria-label="`Retirer ${option.label}`"
          @click="remove(option.value)"
        >
          <svg viewBox="0 0 24 24" class="size-3" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Option = { value: string, label: string }

const props = withDefaults(defineProps<{
  modelValue: string[]
  options: readonly Option[]
  placeholder?: string
  emptyText?: string
}>(), {
  placeholder: 'Rechercher…',
  emptyText: 'Aucun résultat.',
})

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return props.options
    .filter(option => !props.modelValue.includes(option.value) && option.label.toLowerCase().includes(q))
    .slice(0, 8)
})

const selectedOptions = computed(() =>
  props.modelValue
    .map(value => props.options.find(option => option.value === value))
    .filter((option): option is Option => option !== undefined),
)

function add(value: string) {
  if (!props.modelValue.includes(value)) {
    emit('update:modelValue', [...props.modelValue, value])
  }
  query.value = ''
}

function remove(value: string) {
  emit('update:modelValue', props.modelValue.filter(v => v !== value))
}
</script>
