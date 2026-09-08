import { defineStore } from 'pinia'
import type { AuthUser, Credentials, RegisterPayload } from '~/types/auth'
import { authenticate, createAccount } from '~/lib/mockAuthApi'

/**
 * Store de session.
 *
 * Ne contient que l'utilisateur courant + l'état de requête. La logique de
 * "backend" (comptes, vérification) est isolée dans `~/lib/mockAuthApi`.
 * `user` est persisté par pinia-plugin-persistedstate sous `sportmeal:session`.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    pending: false,
  }),

  getters: {
    isAuthenticated: state => state.user !== null,
  },

  actions: {
    async register(payload: RegisterPayload) {
      this.pending = true
      try {
        this.user = await createAccount(payload)
      }
      finally {
        this.pending = false
      }
    },

    async login(credentials: Credentials) {
      this.pending = true
      try {
        this.user = await authenticate(credentials)
      }
      finally {
        this.pending = false
      }
    },

    logout() {
      this.user = null
    },
  },

  persist: {
    key: 'sportmeal:session',
    pick: ['user'],
  },
})
