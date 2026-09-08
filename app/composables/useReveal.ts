import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

/**
 * Révèle un élément la première fois qu'il entre dans le viewport.
 * Branche `target` sur un `ref` de template et utilise `visible` pour l'animation.
 */
export function useReveal(options: { threshold?: number } = {}) {
  const target = ref<HTMLElement | null>(null)
  const visible = ref(false)

  const { stop } = useIntersectionObserver(
    target,
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true
        stop()
      }
    },
    { threshold: options.threshold ?? 0.12 },
  )

  return { target, visible }
}
