import { useDark, useToggle } from '@vueuse/core'

/** Bascule thème clair/sombre, partagée entre la navbar et d'éventuels autres appels. */
export function useThemeToggle() {
  const isDark = useDark()
  const toggle = useToggle(isDark)
  return { isDark, toggle }
}
