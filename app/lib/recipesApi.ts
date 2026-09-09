import type { SupabaseClient } from '@supabase/supabase-js'
import type { RecipeWithTags } from '~/types/recipe'
import { mapDbError } from '~/lib/dbError'

/**
 * Recettes du soir avec leurs tags.
 *
 * Le catalogue est petit : on charge les recettes taguées `soir` (+ tous leurs
 * tags), le filtrage fin type_plat / objectif / temps se fait ensuite côté
 * store. `tags` = simple liste de noms (`soir`, `viande`, `prise_de_masse`, …).
 */
export async function fetchSoirRecipes(supabase: SupabaseClient): Promise<RecipeWithTags[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*, recipe_tags(tags(name))')
    .order('title', { ascending: true })

  if (error) throw new Error(mapDbError(error))

  return (data ?? []).flatMap((row) => {
    const { recipe_tags: links, ...recipe } = row as Record<string, unknown>

    const tags = (Array.isArray(links) ? links : []).flatMap((link) => {
      const raw = (link as Record<string, unknown>).tags
      const tag = (Array.isArray(raw) ? raw[0] : raw) as { name?: string } | null | undefined
      return tag?.name ? [tag.name] : []
    })

    return tags.includes('soir')
      ? [{ ...(recipe as unknown as RecipeWithTags), tags }]
      : []
  })
}
