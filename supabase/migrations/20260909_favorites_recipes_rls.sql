-- SportMeal — RLS pour les repas enregistrés.
-- L'app lit / insère / supprime des lignes de public.favorites avec la session
-- de l'utilisateur connecté. À exécuter dans Supabase Studio > SQL Editor.

--------------------------------------------------------------------------------
-- public.favorites : chacun ne voit / gère que SES favoris
--------------------------------------------------------------------------------
alter table public.favorites enable row level security;

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites for select
  using ((select auth.uid()) = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites for delete
  using ((select auth.uid()) = user_id);

--------------------------------------------------------------------------------
-- public.recipes : catalogue lisible par tous (y compris visiteurs non connectés)
--------------------------------------------------------------------------------
alter table public.recipes enable row level security;

drop policy if exists "recipes_public_read" on public.recipes;
create policy "recipes_public_read"
  on public.recipes for select
  using (true);
