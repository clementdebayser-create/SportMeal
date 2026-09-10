import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

/**
 * Crée le client Supabase (client-side), le fournit (`$supabase` → `useSupabase()`)
 * et hydrate le store d'auth :
 *  - `getSession()` initial, attendu avant le montage de l'app pour que le
 *    middleware `auth` lise une session fiable (le profil se charge ensuite de
 *    façon non bloquante — cf. `profileStatus`) ;
 *  - `onAuthStateChange` pour refléter connexions / déconnexions / refresh.
 *
 * Le client est passé explicitement à `setFromSession` : à ce stade `$supabase`
 * n'est pas encore injecté, donc `useSupabase()` échouerait.
 */
export default defineNuxtPlugin(async () => {
  const { public: config } = useRuntimeConfig()

  if (!config.apiUrl || !config.key) {
    throw new Error(
      'Variables Supabase manquantes : renseigne NUXT_PUBLIC_API_URL et NUXT_PUBLIC_KEY dans .env',
    )
  }

  const supabase = createClient<Database>(config.apiUrl, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  const auth = useAuthStore()

  const { data } = await supabase.auth.getSession()
  await auth.setFromSession(data.session, supabase)

  supabase.auth.onAuthStateChange((event, session) => {
    // INITIAL_SESSION est déjà couvert par le getSession() ci-dessus.
    if (event === 'INITIAL_SESSION') return
    auth.setFromSession(session, supabase)
  })

  return {
    provide: { supabase },
  }
})
