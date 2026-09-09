/** Cycle de vie générique d'un chargement asynchrone (jamais un simple booléen). */
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error'
