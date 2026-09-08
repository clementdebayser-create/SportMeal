<template>
  <div
    ref="target"
    class="h-full"
    :class="visible ? 'animate-fade-up' : 'translate-y-4 opacity-0'"
    :style="{ animationDelay: `${delay}ms` }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const { target, visible } = useReveal()
</script>
