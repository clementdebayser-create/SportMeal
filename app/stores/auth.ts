import { defineStore } from 'pinia'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { AuthIdentity, Credentials, ProfileRow, ProfileStatus, RegisterPayload } from '~/types/auth'
import type { ProfileDietary, ProfileTastes } from '~/types/dietary'

const PROFILE_SAVE_FAILED
  = 'Ton compte a été créé mais l’enregistrement de ton profil a échoué. Réessaie ou contacte le support.'

/**
 * État de session + profil (état partagé uniquement).
 *
 *  - `user`  : identité Supabase Auth. `null` = non connecté.
 *  - `profile` + `profileStatus` + `profileError` : la ligne `public.users`,
 *    avec un cycle de vie explicite ('idle' | 'loading' | 'ready' | 'error').
 *
 * Les appels réseau sont délégués à `useAuth()` / `useProfile()` ; ce store
 * n'orchestre que l'état. Pas de `persist` : Supabase persiste la session,
 * le profil est rechargé au démarrage par `plugins/supabase.client.ts`.
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
    /**
     * Incrémenté à chaque `loadProfile()`. Une réponse dont le numéro ne
     * correspond plus est ignorée : évite qu'une lecture lente écrase une
     * mise à jour plus récente (édition du profil + rechargement concurrent).
     */
    profileLoadSeq: 0,

    /** Préférences alimentaires (chargées avec le profil, non critiques). */
    profileDietary: null as ProfileDietary | null,
    profileTastes: null as ProfileTastes | null,
  }),

  getters: {
    isAuthenticated: state => state.user !== null,
    firstName: state => state.profile?.first_name ?? '',
  },

  actions: {
    /**
     * Recale l'identité depuis une session Supabase et (re)charge le profil.
     * `client` est passé par `plugins/supabase.client.ts` au démarrage (avant que
     * `$supabase` ne soit injecté) ; ailleurs il est résolu via `useSupabase()`.
     */
    async setFromSession(session: Session | null, client?: SupabaseClient) {
      if (session?.user) {
        const sameUser = this.user?.id === session.user.id
        this.user = { id: session.user.id, email: session.user.email ?? '' }
        this.ready = true
        // Ne (re)charge le profil que si l'utilisateur a changé ou n'est pas
        // encore chargé. Un `TOKEN_REFRESHED` / `SIGNED_IN` redondant (rafraîchi
        // de token, retour sur l'onglet…) ne doit pas relancer une lecture qui
        // pourrait arriver après — et écraser — une édition locale récente.
        if (!sameUser || this.profileStatus === 'idle' || this.profileStatus === 'error') {
          // Chargement non bloquant : le statut est suivi séparément.
          void this.loadProfile(client)
        }
      }
      else {
        this.user = null
        this.profile = null
        this.profileStatus = 'idle'
        this.profileError = null
        this.profileDietary = null
        this.profileTastes = null
        this.ready = true
      }
    },

    /**
     * Lit `public.users` pour l'utilisateur courant. Gère les 3 états.
     * Si un profil est déjà affiché, le rechargement est silencieux (pas de
     * bascule vers 'loading' / 'error') pour ne pas faire clignoter la page.
     */
    async loadProfile(client?: SupabaseClient) {
      if (!this.user) return
      const { fetchProfile } = useProfile(client)
      const requestedFor = this.user.id
      const isFirstLoad = !this.profile
      const seq = ++this.profileLoadSeq

      if (isFirstLoad) this.profileStatus = 'loading'
      this.profileError = null
      try {
        const row = await fetchProfile(requestedFor)
        // Réponse périmée : un `loadProfile()` plus récent a été lancé entre-temps.
        if (seq !== this.profileLoadSeq) return
        // La session a pu changer (déconnexion) pendant la requête : on ignore.
        if (this.user?.id !== requestedFor) return

        if (!row) {
          if (!isFirstLoad) return
          // `register` a pu écrire le profil pendant qu'on attendait la requête
          // (la ligne `users` n'existait pas encore au moment du fetch) : ne pas
          // écraser un profil valide avec un état d'erreur.
          if (this.profile) return
          this.profile = null
          this.profileStatus = 'error'
          this.profileError = 'Profil introuvable : il n’a peut-être pas été enregistré à l’inscription.'
          return
        }
        this.profile = row
        this.profileStatus = 'ready'
        // Préférences alimentaires : non bloquant, non critique.
        void this.loadFoodPreferences(client)
      }
      catch (error) {
        if (seq !== this.profileLoadSeq) return
        if (this.user?.id !== requestedFor) return
        // Rechargement en tâche de fond qui échoue : on garde l'affichage courant.
        if (!isFirstLoad) return
        // Idem : un profil écrit entre-temps (inscription) prime sur l'erreur.
        if (this.profile) return
        this.profile = null
        this.profileStatus = 'error'
        this.profileError = error instanceof Error ? error.message : 'Erreur de chargement du profil.'
      }
    },

    /** Charge régime / allergies / goûts. Échec silencieux (affiché comme vide). */
    async loadFoodPreferences(client?: SupabaseClient) {
      if (!this.user) return
      const { fetchDietary, fetchTastes } = useDietaryPreferences(client)
      const requestedFor = this.user.id
      const seq = ++this.profileLoadSeq
      try {
        const [dietary, tastes] = await Promise.all([
          fetchDietary(requestedFor),
          fetchTastes(requestedFor),
        ])
        if (seq !== this.profileLoadSeq) return
        if (this.user?.id !== requestedFor) return
        this.profileDietary = dietary
        this.profileTastes = tastes
      }
      catch {
        if (seq !== this.profileLoadSeq) return
        if (this.user?.id !== requestedFor) return
        this.profileDietary = this.profileDietary ?? { regime: [], allergene: [] }
        this.profileTastes = this.profileTastes ?? { liked: [], disliked: [] }
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
     * Sur une nouvelle tentative (`user` déjà défini), l'étape 1 est sautée.
     */
    async register(payload: RegisterPayload) {
      const { signUp, hasActiveSession } = useAuth()
      const { insertProfile } = useProfile()
      this.pending = true
      try {
        if (!this.user) {
          this.user = await signUp(payload)
        }

        let failedExtras: string[] = []
        try {
          const result = await insertProfile(this.user.id, payload)
          this.profile = result.profile
          this.profileStatus = 'ready'
          this.profileError = null
          failedExtras = result.failedExtras
          // Les tags régime / allergène et les goûts viennent d'être écrits :
          // on les charge tout de suite pour que /account les affiche sans
          // attendre une première modification. Échec silencieux (non critique).
          await this.loadFoodPreferences()
        }
        catch (error) {
          this.profileStatus = 'error'
          this.profileError = error instanceof Error ? error.message : 'Échec de l’enregistrement du profil.'
          throw new Error(PROFILE_SAVE_FAILED)
        }

        return {
          needsEmailConfirmation: !(await hasActiveSession()),
          failedExtras,
        }
      }
      finally {
        this.pending = false
      }
    },

    async login(credentials: Credentials) {
      const { signIn } = useAuth()
      this.pending = true
      try {
        this.user = await signIn(credentials)
        await this.loadProfile()
      }
      finally {
        this.pending = false
      }
    },

    /**
     * Déconnexion. L'état local est vidé AVANT l'appel Supabase : l'UI et la
     * redirection déclenchée par l'appelant ne dépendent jamais de la réponse
     * réseau. `profileStatus` repasse à 'idle' (état neutre).
     */
    async logout() {
      const { signOut } = useAuth()

      this.user = null
      this.profile = null
      this.profileStatus = 'idle'
      this.profileError = null
      this.ready = true

      try {
        await signOut()
      }
      catch {
        // Session déjà invalide côté serveur : le nettoyage local suffit.
      }
    },
  },
})
