import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Traduction des erreurs Supabase en messages français affichables.
 * Fonctions pures — aucune dépendance Vue / client Supabase.
 */

type DbError = PostgrestError | { message: string, code?: string }

function isNetwork(message: string): boolean {
  return message.includes('failed to fetch')
    || message.includes('networkerror')
    || message.includes('network request failed')
}

/** Erreurs Supabase Auth (messages en clair renvoyés par `auth.*`). */
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
  if (m.includes('unable to validate email address') || m.includes('invalid email')
    || (m.includes('email') && m.includes('invalid')))
    return 'Adresse e-mail invalide ou non acceptée.'
  if (m.includes('for security purposes') || m.includes('rate limit') || m.includes('too many requests'))
    return 'Trop de tentatives, réessaie dans quelques instants.'
  if (m.includes('jwt expired') || m.includes('session_not_found') || m.includes('session not found')
    || m.includes('invalid refresh token') || m.includes('refresh_token_not_found') || m.includes('missing sub'))
    return 'Session expirée. Reconnecte-toi et réessaie.'
  if (m.includes('new password should be different') || m.includes('same as the old password'))
    return 'Le nouveau mot de passe doit être différent de l’ancien.'
  if (isNetwork(m))
    return 'Problème de connexion. Vérifie ton réseau et réessaie.'
  return message || 'Une erreur est survenue.'
}

/** Erreurs Postgrest génériques (lecture / écriture de tables). */
export function mapDbError(error: DbError): string {
  const code = 'code' in error ? error.code : undefined
  const m = (error.message || '').toLowerCase()

  if (code === '42501' || m.includes('row-level security'))
    return 'Action refusée (droits insuffisants). Contacte le support.'
  if (code === '23503')
    return 'Élément lié introuvable.'
  if (code === '23505')
    return 'Cet élément est déjà enregistré.'
  if (isNetwork(m))
    return 'Problème de connexion. Vérifie ton réseau et réessaie.'

  return error.message || 'Une erreur est survenue.'
}

/** Erreurs Postgrest spécifiques à l'écriture / lecture du profil `public.users`. */
export function mapProfileError(error: DbError): string {
  const code = 'code' in error ? error.code : undefined
  const m = (error.message || '').toLowerCase()

  if (code === '23505') return 'Un profil existe déjà pour ce compte.'
  if (code === '23503') return 'Aucun compte ne correspond à ce profil.'
  if (code === '42501' || m.includes('row-level security'))
    return 'Enregistrement du profil refusé (droits insuffisants). Contacte le support.'
  if (isNetwork(m))
    return 'Problème de connexion. Vérifie ton réseau et réessaie.'
  return error.message || 'Erreur lors de l’accès au profil.'
}
