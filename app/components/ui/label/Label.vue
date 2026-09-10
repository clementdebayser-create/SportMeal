<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Label, type LabelProps } from 'reka-ui'
import { cn } from '@/utils/cn'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Label
    data-slot="label"
    v-bind="props"
    :class="cn(
      'flex items-center gap-2 text-sm font-medium leading-none text-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
      props.class,
    )"
  >
    <slot />
  </Label>
</template>
