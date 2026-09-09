import type { SupabaseClient } from '@supabase/supabase-js'
import type { RecipeRow } from '~/types/recipe'
import { mapDbError } from '~/lib/dbError'

/** Toutes les recettes disponibles (le catalogue est petit ; on tire au sort côté client). */
export async function fetchAllRecipes(supabase: SupabaseClient): Promise<RecipeRow[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('title', { ascending: true })

  if (error) throw new Error(mapDbError(error))
  return (data ?? []) as RecipeRow[]
}
