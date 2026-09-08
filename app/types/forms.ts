export type FieldError = string | undefined

/** Une règle prend la valeur du champ et renvoie un message d'erreur, ou undefined si valide. */
export type ValidationRule = (value: string) => FieldError

export type FormErrors<T> = Partial<Record<keyof T, string>>
