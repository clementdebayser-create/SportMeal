/**
 * Déconnexion + redirection explicite vers /login.
 *
 * La redirection est faite ici, pas laissée au middleware : celui-ci ne se
 * redéclenche pas sur un simple changement d'état quand on est déjà sur une
 * page protégée (ex: /account). On vide aussi les données propres à
 * l'utilisateur (favoris) pour ne pas les exposer au compte suivant.
 */
export function useLogout() {
  const auth = useAuthStore()
  const favorites = useFavoritesStore()

  return async function logout() {
    await auth.logout()
    favorites.reset()
    await navigateTo('/login')
  }
}
