import type { AuthIdentity, Credentials, RegisterPayload } from '~/types/auth'
import { mapAuthError } from '~/utils/errors'

/**
 * Accès à Supabase Auth (comptes + mots de passe).
 *
 * Logique et accès aux données — pas un utilitaire pur : le client Supabase
 * est résolu via `useSupabase()`. L'état de session vit dans `stores/auth.ts`,
 * qui appelle ces fonctions ; le profil applicatif est géré par `useProfile()`.
 */
export function useAuth() {
  const supabase = useSupabase()

  function toIdentity(user: { id: string, email?: string | null }, fallbackEmail: string): AuthIdentity {
    return { id: user.id, email: user.email ?? fallbackEmail }
  }

  /** Crée le compte Auth. N'écrit PAS le profil (voir `useProfile().insertProfile`). */
  async function signUp(payload: RegisterPayload): Promise<AuthIdentity> {
    const email = payload.email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signUp({ email, password: payload.password })

    if (error) throw new Error(mapAuthError(error.message))
    if (!data.user) throw new Error('Inscription impossible : aucun utilisateur retourné par Supabase.')

    return toIdentity(data.user, email)
  }

  async function signIn(credentials: Credentials): Promise<AuthIdentity> {
    const email = credentials.email.trim().toLowerCase()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: credentials.password })

    if (error) throw new Error(mapAuthError(error.message))
    if (!data.user) throw new Error('Connexion impossible.')

    return toIdentity(data.user, email)
  }

  async function signOut(): Promise<void> {
    // scope 'local' : vide la session du navigateur sans appel réseau bloquant.
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw new Error(mapAuthError(error.message))
  }

  /** true si une session active existe (absente après signUp => confirmation d'e-mail requise). */
  async function hasActiveSession(): Promise<boolean> {
    const { data } = await supabase.auth.getSession()
    return data.session !== null
  }

  /**
   * Vérifie le mot de passe courant en tentant une ré-authentification.
   * `true` = correct, `false` = incorrect. Les autres erreurs sont propagées.
   */
  async function verifyCurrentPassword(currentPassword: string): Promise<boolean> {
    const { data } = await supabase.auth.getSession()
    const email = data.session?.user?.email
    if (!email) throw new Error('Session introuvable. Reconnecte-toi et réessaie.')

    const { error } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (!error) return true
    if (error.message.toLowerCase().includes('invalid login credentials')) return false
    throw new Error(mapAuthError(error.message))
  }

  /** Change le mot de passe du compte Auth (session courante). */
  async function updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(mapAuthError(error.message))
  }

  return { signUp, signIn, signOut, hasActiveSession, verifyCurrentPassword, updatePassword }
}
