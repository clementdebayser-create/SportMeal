import type { AuthUser, Credentials, RegisterPayload } from '~/types/auth'

/**
 * Faux backend d'authentification.
 *
 * La "base" de comptes vit dans localStorage (`sportmeal:accounts`).
 * Le jour où une vraie API arrive, seul ce fichier est à remplacer :
 * `createAccount` et `authenticate` gardent la même signature.
 */

interface StoredAccount extends AuthUser {
  password: string
}

const ACCOUNTS_KEY = 'sportmeal:accounts'

function readAccounts(): StoredAccount[] {
  if (!import.meta.client) return []
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]')
  }
  catch {
    return []
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  if (!import.meta.client) return
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

/** Simule la latence réseau. */
function delay(ms = 450) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function toUser(account: StoredAccount): AuthUser {
  return {
    name: account.name,
    email: account.email,
    sport: account.sport,
    frequency: account.frequency,
  }
}

export async function createAccount(payload: RegisterPayload): Promise<AuthUser> {
  await delay()
  const email = payload.email.trim().toLowerCase()
  const accounts = readAccounts()

  if (accounts.some(a => a.email === email)) {
    throw new Error('Un compte existe déjà avec cette adresse e-mail.')
  }

  const account: StoredAccount = {
    name: payload.name.trim(),
    email,
    password: payload.password,
    sport: payload.sport,
    frequency: payload.frequency,
  }
  writeAccounts([...accounts, account])
  return toUser(account)
}

export async function authenticate(credentials: Credentials): Promise<AuthUser> {
  await delay()
  const email = credentials.email.trim().toLowerCase()
  const account = readAccounts().find(a => a.email === email)

  if (!account || account.password !== credentials.password) {
    throw new Error('E-mail ou mot de passe incorrect.')
  }

  return toUser(account)
}
