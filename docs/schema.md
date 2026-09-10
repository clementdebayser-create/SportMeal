# Schéma Supabase — SportMeal

Base PostgreSQL hébergée sur Supabase. Les types TypeScript générés sont dans
`app/types/database.types.ts` (`Tables<'…'>`, `TablesInsert<'…'>`).

L'authentification est gérée par **Supabase Auth** (`auth.users`, hors schéma
`public`). Les 7 tables métier ci-dessous vivent dans le schéma `public`.

| Table | Rôle |
|---|---|
| `users` | Profil applicatif, une ligne par compte Auth |
| `recipes` | Catalogue de recettes |
| `ingredients` | Référentiel d'ingrédients |
| `recipe_ingredients` | Composition d'une recette (jointure recette ↔ ingrédient) |
| `tags` | Étiquettes de recettes (repas, type de plat, objectif) |
| `recipe_tags` | Tags d'une recette (jointure recette ↔ tag) |
| `favorites` | Repas enregistrés par un utilisateur |

---

## `users` — profil

Une ligne par utilisateur, `id` = `auth.users.id` (FK, `on delete cascade`).
Créée explicitement par l'app après `auth.signUp()` (pas de trigger).

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users.id` |
| `email` | `text` | non nul, unique |
| `first_name` | `text` | non nul (prénom) |
| `sport` | `text` \| null | valeurs : cf. `app/constants/profile.ts` |
| `level` | `text` \| null | niveau (pas encore collecté par le formulaire) |
| `objectif` | `text` \| null | `perte_de_poids` / `prise_de_masse` / `maintien` / `endurance` |
| `frequence` | `text` \| null | fréquence d'entraînement |
| `created_at` | `timestamptz` | défaut `now()` |

RLS : lecture / écriture limitées au propriétaire (`auth.uid() = id`).

## `recipes` — catalogue

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `title` | `text` | non nul |
| `description` | `text` \| null | |
| `image_url` | `text` \| null | |
| `prep_time_minutes` | `int` \| null | |
| `cook_time_minutes` | `int` \| null | temps total = `prep_time_minutes + cook_time_minutes` |
| `servings` | `int` \| null | |
| `difficulty` | `text` \| null | `facile` / `moyen` / … |
| `calories_kcal` | `int` \| null | |
| `protein_g` / `carbs_g` / `fat_g` | `int` \| null | macros |
| `created_at` | `timestamptz` | défaut `now()` |

RLS (si activée) : lecture publique.

## `ingredients` — référentiel

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | non nul |
| `category` | `text` \| null | ex: légume, féculent, protéine |
| `unit` | `text` \| null | unité par défaut |

## `recipe_ingredients` — composition d'une recette

Jointure recette ↔ ingrédient avec quantité.

| Colonne | Type | Notes |
|---|---|---|
| `recipe_id` | `uuid` | FK → `recipes.id` (`on delete cascade`) |
| `ingredient_id` | `uuid` | FK → `ingredients.id` (`on delete cascade`) |
| `quantity` | `numeric` | non nul |
| `unit` | `text` \| null | surcharge éventuelle de l'unité |

PK composite `(recipe_id, ingredient_id)`.

## `tags` — étiquettes

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | non nul (`soir`, `viande`, `prise_de_masse`, …) |
| `category` | `text` \| null | `repas` / `type_plat` / `objectif` |

Catégories actuelles :
- `repas` : `soir`, `midi`, `petit_dejeuner`
- `type_plat` : `viande`, `poisson`, `vegetarien`
- `objectif` : `perte_de_poids`, `prise_de_masse`, `maintien`, `endurance`

RLS (si activée) : lecture publique.

## `recipe_tags` — tags d'une recette

Jointure recette ↔ tag. Utilisée par « Mon repas du soir » pour filtrer.

| Colonne | Type | Notes |
|---|---|---|
| `recipe_id` | `uuid` | FK → `recipes.id` (`on delete cascade`) |
| `tag_id` | `uuid` | FK → `tags.id` (`on delete cascade`) |

PK composite `(recipe_id, tag_id)`.

## `favorites` — repas enregistrés

| Colonne | Type | Notes |
|---|---|---|
| `user_id` | `uuid` | FK → `users.id` (`on delete cascade`) |
| `recipe_id` | `uuid` | FK → `recipes.id` (`on delete cascade`) |
| `created_at` | `timestamptz` | défaut `now()` |

PK composite `(user_id, recipe_id)` — impossible d'enregistrer deux fois la même
recette pour un même utilisateur.

RLS : lecture / insertion / suppression limitées au propriétaire
(`auth.uid() = user_id`).

---

## Migrations

Les scripts SQL de mise en place de la RLS sont dans `supabase/migrations/`.
