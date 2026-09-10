# Base de données SportMeal

Projet Supabase : `qaannbudahqalupwhufp` (région eu-central-1, Postgres 17).

## Vue d'ensemble

9 tables dans le schéma `public`, réparties en 3 groupes :

- **Profil utilisateur** : `users`, `user_dietary_tags`, `taste_preferences`
- **Catalogue de recettes** : `recipes`, `ingredients`, `recipe_ingredients`, `tags`, `recipe_tags`
- **Interaction utilisateur** : `favorites`

L'authentification (comptes, mots de passe, sessions) est gérée par **Supabase Auth** (`auth.users`), séparée de `public.users` qui ne stocke que les données de profil.

## Tables

### `users` (profil)
Une ligne par compte, liée 1-1 à `auth.users` (même `id`).

| Colonne | Type | Description |
|---|---|---|
| `id` | uuid, PK, FK → `auth.users.id` | Même identifiant que le compte Auth |
| `email` | text, unique | Dupliqué depuis Auth pour un accès simple |
| `first_name` | text | Prénom |
| `sport` | text | Sport pratiqué |
| `level` | text | Niveau (pas encore utilisé côté UI) |
| `objectif` | text | `perte_de_poids` / `prise_de_masse` / `maintien` / `endurance` |
| `frequence` | text | Fréquence d'entraînement |
| `age` | integer | Optionnel |
| `sexe` | text | Optionnel |
| `poids_kg` | numeric | Optionnel |
| `taille_cm` | numeric | Optionnel |
| `created_at` | timestamptz | |

### `user_dietary_tags` (allergies + régimes, choix multiples)
Table de liaison `users` ↔ `tags`. Clé primaire composite `(user_id, tag_id)`.
Un tag de catégorie `allergene` = allergie déclarée. Un tag de catégorie `regime` = régime alimentaire suivi.

### `taste_preferences` (goûts et aversions)
| Colonne | Type |
|---|---|
| `user_id` | uuid, FK → `users.id` |
| `ingredient_id` | uuid, FK → `ingredients.id` |
| `preference_type` | text, contrainte CHECK : `aime` ou `deteste` |

Clé primaire composite `(user_id, ingredient_id)` : un seul avis par ingrédient et par utilisateur.

### `recipes`
| Colonne | Type | Description |
|---|---|---|
| `id` | uuid, PK | |
| `title`, `description` | text | |
| `image_url` | text | |
| `prep_time_minutes`, `cook_time_minutes` | integer | |
| `servings` | integer | |
| `difficulty` | text | |
| `calories_kcal`, `protein_g`, `carbs_g`, `fat_g` | number | Valeurs par portion |
| `allergens_audited` | boolean, défaut `false` | `true` = les ingrédients ont été vérifiés et tagués pour allergènes. **Une recette à `false` ne doit jamais être considérée comme sans danger.** |
| `created_at` | timestamptz | |

### `ingredients`
`id`, `name`, `category` (proteine / feculent / legume / produit_laitier / condiment...), `unit`.

### `recipe_ingredients`
Liaison `recipes` ↔ `ingredients` avec `quantity` et `unit`. Clé primaire composite `(recipe_id, ingredient_id)`.

### `tags`
`id`, `name` (unique globalement, tous types confondus), `category` :
- `repas` : `soir`, `midi`, `petit_dejeuner`
- `type_plat` : `viande`, `poisson`, `vegetarien`
- `objectif` : `perte_de_poids`, `prise_de_masse`, `maintien`, `endurance`
- `regime` : `vegan`, `halal`, `casher`, `sans_porc`, `pescetarien` (+ `vegetarien` réutilisé depuis `type_plat`)
- `allergene` : `gluten`, `lactose`, `arachides`, `fruits_de_mer`, `oeufs`, `soja`, `fruits_a_coque`

### `recipe_tags`
Liaison `recipes` ↔ `tags`. Clé primaire composite `(recipe_id, tag_id)`.

### `favorites`
`user_id` (FK → `users.id`), `recipe_id` (FK → `recipes.id`), `created_at`. Clé primaire composite `(user_id, recipe_id)`.

## Row Level Security (RLS)

RLS est activée sur les 9 tables. Aucune n'est accessible en écriture libre.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `recipes`, `ingredients`, `tags`, `recipe_ingredients`, `recipe_tags` | Tout le monde (`true`) | — | — | — |
| `users` | `auth.uid() = id` | `auth.uid() = id` | `auth.uid() = id` | — |
| `favorites` | `auth.uid() = user_id` | `auth.uid() = user_id` | — | `auth.uid() = user_id` |
| `user_dietary_tags` | `auth.uid() = user_id` | `auth.uid() = user_id` | — | `auth.uid() = user_id` |
| `taste_preferences` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Ce que ça garantit :**
- Le catalogue (recettes, ingrédients, tags) est en lecture libre pour tous, mais **aucune écriture n'est possible depuis l'app** (client `anon`/`authenticated`) — seul un accès direct à la base (SQL Editor, migrations) peut le modifier.
- Chaque utilisateur ne peut lire, créer ou supprimer que ses propres lignes dans `users`, `favorites`, `user_dietary_tags` et `taste_preferences`.
- La suppression d'un compte (`auth.users`) supprime en cascade sa ligne `users`, ainsi que ses favoris, tags alimentaires et goûts associés.

## Points d'attention connus

- `recipes.allergens_audited = false` sur une future recette signifie que ses allergènes n'ont pas été vérifiés : le filtrage par allergie doit traiter ce cas comme "à exclure par précaution" si l'utilisateur a une allergie déclarée, pas comme "sans danger".
- Le tag `vegetarien` sert à la fois de `type_plat` (filtre de recherche) et de contrainte de régime — il n'existe qu'une seule fois en base, pas de doublon entre les deux catégories.
- La catégorisation `casher` sur les recettes est approximative (basée sur l'absence de porc, pas sur une vérification d'abattage rituel) — à ne pas présenter comme une certification réelle.
