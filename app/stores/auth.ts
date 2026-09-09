import { defineStore } from 'pinia'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { AuthIdentity, Credentials, ProfileRow, ProfileStatus, RegisterPayload } from '~/types/auth'
import { hasActiveSession, signIn, signOut, signUp } from '~/lib/authApi'
import { fetchProfile, insertProfile } from '~/lib/profileApi'

const PROFILE_SAVE_FAILED
  = 'Ton compte a été créé mais l’enregistrement de ton profil a échoué. Réessaie ou contacte le support.'

/**
 * Deux préoccupations distinctes dans ce store :
 *
 *  - `user`  : identité Supabase Auth (session). `null` = non connecté.
 *  - `profile` + `profileStatus` + `profileError` : la ligne `public.users`,
 *    avec un cycle de vie explicite ('idle' | 'loading' | 'ready' | 'error')
 *    — pas un simple booléen — pour que `account.vue` distingue
 *    « en cours de chargement », « chargé » et « erreur ».
 *
 * Pas de `persist` : Supabase persiste déjà la session ; le profil est
 * rechargé au démarrage par `plugins/supabase.client.ts`.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthIdentity | null,
    /** true dès que la session initiale a été résolue (évite les redirects prématurés). */
    ready: false,
    /** signUp / signIn en cours. */
    pending: false,

    profile: null as ProfileRow | null,
    profileStatus: 'idle' as ProfileStatus,
    profileError: null as string | null,
  }),

  getters: {
    isAuthenticated: state => state.user !== null,
    firstName: state => state.profile?.first_name ?? '',
  },

  actions: {
    /** Recale l'identité depuis une session Supabase et (re)charge le profil. */
    async setFromSession(session: Session | null, client?: SupabaseClient) {
      if (session?.user) {
        this.user = { id: session.user.id, email: session.user.email ?? '' }
        this.ready = true
        // Chargement non bloquant : le statut est suivi séparément.
        void this.loadProfile(client)
      }
      else {
        this.user = null
        this.profile = null
        this.profileStatus = 'idle'
        this.profileError = null
        this.ready = true
      }
    },

    /** Lit `public.users` pour l'utilisateur courant. Gère les 3 états. */
    async loadProfile(client?: SupabaseClient) {
      if (!this.user) return
      const supabase = client ?? useSupabase()
      const requestedFor = this.user.id

      this.profileStatus = 'loading'
      this.profileError = null
      try {
        const row = await fetchProfile(supabase, requestedFor)
        // La session a pu changer (déconnexion) pendant la requête : on ignore.
        if (this.user?.id !== requestedFor) return

        if (!row) {
          this.profile = null
          this.profileStatus = 'error'
          this.profileError = 'Profil introuvable : il n’a peut-être pas été enregistré à l’inscription.'
          return
        }
        this.profile = row
        this.profileStatus = 'ready'
      }
      catch (error) {
        if (this.user?.id !== requestedFor) return
        this.profile = null
        this.profileStatus = 'error'
        this.profileError = error instanceof Error ? error.message : 'Erreur de chargement du profil.'
      }
    },

    /** Relance la lecture du profil (bouton « Réessayer » de account.vue). */
    retryProfile() {
      return this.loadProfile()
    },

    /**
     * Inscription en deux temps :
     *  1. `signUp` (Auth) — les erreurs (e-mail déjà pris, …) remontent telles quelles.
     *  2. `insertProfile` (public.users) — si ça échoue, le statut passe à 'error'
     *     ET une erreur explicite est levée pour rester visible dans le formulaire.
     *
     * Sur une nouvelle tentative (`user` déjà défini), l'étape 1 est sautée :
     * cliquer à nouveau « Créer mon compte » ré-essaie seulement l'insertion.
     */
    async register(payload: RegisterPayload) {
      const supabase = useSupabase()
      this.pending = true
      try {
        if (!this.user) {
          this.user = await signUp(supabase, payload)
        }

        try {
          this.profile = await insertProfile(supabase, this.user.id, payload)
          this.profileStatus = 'ready'
          this.profileError = null
        }
        catch (error) {
          this.profileStatus = 'error'
          this.profileError = error instanceof Error ? error.message : 'Échec de l’enregistrement du profil.'
          throw new Error(PROFILE_SAVE_FAILED)
        }

        return { needsEmailConfirmation: !(await hasActiveSession(supabase)) }
      }
      finally {
        this.pending = false
      }
    },

    async login(credentials: Credentials) {
      const supabase = useSupabase()
      this.pending = true
      try {
        this.user = await signIn(supabase, credentials)
        await this.loadProfile(supabase)
      }
      finally {
        this.pending = false
      }
    },

    /**
     * Déconnexion.
     *
     * L'état local est vidé AVANT l'appel Supabase : l'UI (et la redirection
     * déclenchée par l'appelant) ne doit jamais dépendre de la réponse réseau.
     * `profileStatus` repasse à 'idle' (état neutre, pas 'loading' / 'error').
     */
    async logout() {
      const supabase = useSupabase()

      this.user = null
      this.profile = null
      this.profileStatus = 'idle'
      this.profileError = null
      this.ready = true

      try {
        await signOut(supabase)
      }
      catch {
        // Session déjà invalide côté serveur : le nettoyage local suffit.
      }
    },
  },
})
