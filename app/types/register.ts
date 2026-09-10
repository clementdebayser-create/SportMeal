/** Champs texte du formulaire d'inscription (tous gérés par `useForm`). */
export type RegisterFormValues = {
  name: string
  email: string
  password: string
  sport: string
  frequency: string
  level: string
  objectif: string
  age: string
  sexe: string
  poids: string
  taille: string
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>
