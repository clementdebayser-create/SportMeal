import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Client Supabase partagé (fourni par `plugins/supabase.client.ts`).
 * Uniquement disponible côté client : l'auth de ce projet est client-side.
 */
export function useSupabase(): SupabaseClient {
  const { $supabase } = useNuxtApp()
  if (!$supabase) {
    throw new Error('Client Supabase indisponible (appelé côté serveur ?).')
  }
  return $supabase as SupabaseClient
}
