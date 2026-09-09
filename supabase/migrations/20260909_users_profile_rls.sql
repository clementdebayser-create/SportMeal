-- SportMeal — public.users = table de PROFIL, écrite côté application.
--
-- L'app crée la ligne explicitement après auth.signUp() :
--   supabase.from('users').upsert({ id: data.user.id, ... })
-- Il n'y a donc PAS de trigger. Ce script se contente de sécuriser la table.
--
-- À exécuter dans Supabase Studio > SQL Editor.

--------------------------------------------------------------------------------
-- 1. Schéma : plus de mot de passe géré ici, id lié à auth.users
--------------------------------------------------------------------------------
alter table public.users drop column if exists password_hash;

-- (au besoin) nettoyer les lignes sans compte Auth avant d'ajouter la FK :
-- delete from public.users where id not in (select id from auth.users);

alter table public.users
  drop constraint if exists users_id_fkey;
alter table public.users
  add constraint users_id_fkey
  foreign key (id) references auth.users (id) on delete cascade;

--------------------------------------------------------------------------------
-- 2. Row Level Security : chacun ne lit / n'écrit que SON profil
--------------------------------------------------------------------------------
-- NB : l'INSERT (comme le SELECT/UPDATE) exige une session active.
-- => garde la confirmation d'e-mail DÉSACTIVÉE (Auth > Providers > Email),
--    sinon l'insert juste après signUp n'a pas encore de session et échoue
--    (l'app affichera alors « profil non enregistré, réessaie »).

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  using ((select auth.uid()) = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
  on public.users for insert
  with check ((select auth.uid()) = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
