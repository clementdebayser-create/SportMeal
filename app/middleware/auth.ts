/**
 * Protège les parties réservées aux personnes connectées.
 * La session est restaurée depuis localStorage par pinia-plugin-persistedstate
 * (client uniquement), donc le contrôle se fait côté client.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
