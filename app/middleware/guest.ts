/**
 * Pages réservées aux visiteurs non connectés (ex: /login).
 * Un utilisateur déjà connecté est renvoyé vers son compte.
 * Contrôle client-side (session Supabase dans le navigateur).
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const auth = useAuthStore()
  if (auth.isAuthenticated) {
    return navigateTo('/account')
  }
})
