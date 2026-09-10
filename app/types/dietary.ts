/** Une option de tag régime / allergène présentée dans le formulaire. */
export interface TagOption {
  id: string
  /** Nom technique (colonne `tags.name`). */
  name: string
  /** Libellé français affiché. */
  label: string
}

/** Un ingrédient sélectionnable (goûts / aversions). */
export interface IngredientOption {
  id: string
  name: string
}

/** Options alimentaires chargées depuis la table `tags`. */
export interface DietaryOptions {
  regime: TagOption[]
  allergene: TagOption[]
}

/** Tags régime / allergène associés au profil de l'utilisateur. */
export interface ProfileDietary {
  regime: TagOption[]
  allergene: TagOption[]
}

/** Goûts / aversions associés au profil de l'utilisateur. */
export interface ProfileTastes {
  liked: IngredientOption[]
  disliked: IngredientOption[]
}
