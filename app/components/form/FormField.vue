<template>
  <div class="flex flex-col gap-2">
    <Label v-if="label" :for="htmlFor">{{ label }}</Label>
    <slot />
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  htmlFor?: string
  error?: string
}>()
</script>
