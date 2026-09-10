import type { ProfilePatch } from '~/types/auth'

/**
 * Opérations d'édition du compte connecté.
 *
 * Ne fait AUCUN appel Supabase direct : orchestre `useProfile()` (table
 * `public.users`), `useDietaryPreferences()` (régime / allergies / aversions)
 * et `useAuth()` (mot de passe). À invoquer dans un handler côté client, pas
 * au setup SSR.
 */
export function useAccountSettings() {
  /** Met à jour les champs de profil modifiés dans `public.users`. */
  async function updateProfileFields(userId: string, patch: ProfilePatch): Promise<void> {
    await useProfile().updateProfile(userId, patch)
  }

  /**
   * Aligne les préférences alimentaires (régime, allergies, aversions) sur les
   * listes choisies. Chaque partie est tentée indépendamment ; renvoie la liste
   * de celles qui ont échoué.
   */
  async function updateFoodPreferences(userId: string, input: {
    regimeTagIds: string[]
    allergeneTagIds: string[]
    dislikedIngredientIds: string[]
  }): Promise<{ failures: string[] }> {
    const { syncDietaryTags, syncDislikedIngredients } = useDietaryPreferences()
    const failures: string[] = []

    try {
      await syncDietaryTags(userId, [...input.regimeTagIds, ...input.allergeneTagIds])
    }
    catch {
      failures.push('ton régime et tes allergies')
    }
    try {
      await syncDislikedIngredients(userId, input.dislikedIngredientIds)
    }
    catch {
      failures.push('tes ingrédients évités')
    }

    return { failures }
  }

  /**
   * Change le mot de passe après vérification de l'ancien.
   * Lève une erreur explicite si l'ancien est incorrect.
   */
  async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const auth = useAuth()

    if (!(await auth.verifyCurrentPassword(currentPassword))) {
      throw new Error('Ancien mot de passe incorrect.')
    }
    await auth.updatePassword(newPassword)
  }

  return { updateProfileFields, updateFoodPreferences, changePassword }
}
