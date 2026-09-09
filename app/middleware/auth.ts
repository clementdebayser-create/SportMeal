/**
 * Protège les pages réservées aux personnes connectées.
 *
 * Contrôle client-side : la session Supabase vit dans le navigateur et le store
 * est déjà hydraté par `plugins/supabase.client.ts` (plugin async attendu avant
 * l'exécution de ce middleware). On lit donc simplement l'état du store.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
