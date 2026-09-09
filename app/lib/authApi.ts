import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthIdentity, Credentials, RegisterPayload } from '~/types/auth'

/**
 * Appels à Supabase Auth (comptes + mots de passe).
 * Le profil applicatif (`public.users`) est géré séparément dans `profileApi.ts`.
 * Le client est injecté par l'appelant : ce module reste sans contexte Nuxt.
 */

/** Traduit un message d'erreur Supabase Auth en français pour les formulaires. */
export function mapAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Un compte existe déjà avec cette adresse e-mail.'
  if (m.includes('invalid login credentials'))
    return 'E-mail ou mot de passe incorrect.'
  if (m.includes('email not confirmed'))
    return 'Confirme ton adresse e-mail avant de te connecter.'
  if (m.includes('password should be at least') || m.includes('password is too short'))
    return 'Mot de passe trop court.'
  if (m.includes('unable to validate email address') || m.includes('invalid email'))
    return 'Adresse e-mail invalide.'
  if (m.includes('for security purposes') || m.includes('rate limit') || m.includes('too many requests'))
    return 'Trop de tentatives, réessaie dans quelques instants.'
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed'))
    return 'Problème de connexion. Vérifie ton réseau et réessaie.'
  return message || 'Une erreur est survenue.'
}

function toIdentity(user: { id: string, email?: string | null }, fallbackEmail: string): AuthIdentity {
  return { id: user.id, email: user.email ?? fallbackEmail }
}

/** Crée le compte Auth. N'écrit PAS le profil (voir `insertProfile`). */
export async function signUp(supabase: SupabaseClient, payload: RegisterPayload): Promise<AuthIdentity> {
  const email = payload.email.trim().toLowerCase()
  const { data, error } = await supabase.auth.signUp({ email, password: payload.password })

  if (error) throw new Error(mapAuthError(error.message))
  if (!data.user) throw new Error('Inscription impossible : aucun utilisateur retourné par Supabase.')

  return toIdentity(data.user, email)
}

export async function signIn(supabase: SupabaseClient, credentials: Credentials): Promise<AuthIdentity> {
  const email = credentials.email.trim().toLowerCase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: credentials.password })

  if (error) throw new Error(mapAuthError(error.message))
  if (!data.user) throw new Error('Connexion impossible.')

  return toIdentity(data.user, email)
}

export async function signOut(supabase: SupabaseClient): Promise<void> {
  // scope 'local' : vide la session du navigateur sans appel réseau bloquant.
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (error) throw new Error(mapAuthError(error.message))
}

/** Indique si une session active existe (utile après signUp : absent => confirmation d'e-mail requise). */
export async function hasActiveSession(supabase: SupabaseClient): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return data.session !== null
}
