# SportMeal

Application web de recommandation de repas personnalisés selon le sport, l'objectif et les préférences alimentaires de l'utilisateur.

Projet réalisé par **Clément** .

## Fonctionnalités

- **Authentification** : inscription, connexion, déconnexion, mot de passe oublié (Supabase Auth)
- **Profil sportif et alimentaire** : sport pratiqué, niveau, objectif, fréquence d'entraînement, données physiques (âge, sexe, poids, taille), régime alimentaire, allergies, goûts et aversions — le tout modifiable après inscription
- **Recommandation de repas** : recherche de recettes selon type de plat, objectif et temps de préparation, avec exclusion automatique des recettes contenant une allergie déclarée ou un ingrédient détesté
- **Favoris** : enregistrement et consultation des repas préférés
- **Sécurité** : Row Level Security (RLS) activée sur toutes les tables — chaque utilisateur n'accède qu'à ses propres données

## Stack technique

- **[Nuxt 4](https://nuxt.com/)** (Vue 3, SSR), TypeScript
- **Tailwind CSS v4**, **shadcn-nuxt** + **reka-ui** pour l'interface
- **Pinia** + **pinia-plugin-persistedstate** pour l'état partagé
- **[Supabase](https://supabase.com/)** : base de données Postgres, authentification, Row Level Security

## Structure du projet

```
app/
  pages/         écrans et routes
  components/    morceaux d'interface réutilisables
  composables/   logique et accès aux données (appels Supabase)
  stores/        état partagé et cache (Pinia)
  types/         types de la base et types métier
  utils/         fonctions utilitaires pures
  constants/     listes de valeurs statiques (sports, objectifs...)
  layouts/       gabarits de page (Nuxt)
  middleware/    protection des routes (Nuxt)
server/api/      appels nécessitant un secret (inutilisé pour l'instant)
public/          images et fichiers publics
docs/            documentation du projet (schéma de base, etc.)
```

Voir [`docs/database.md`](./docs/database.md) pour le détail du schéma de base de données et des politiques de sécurité (RLS).

## Installation

```bash
npm install
```

Créer un fichier `.env` à la racine avec les identifiants du projet Supabase :

```
SUPABASE_URL=<URL du projet, disponible dans Project Settings > API>
SUPABASE_KEY=<clé anon, disponible dans Project Settings > API>
```

## Développement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

## Build de production

```bash
npm run build
```

## Base de données

Le schéma complet (tables, relations, politiques RLS) est documenté dans [`docs/database.md`](./docs/database.md). Les types TypeScript correspondants sont générés dans `app/types/database.types.ts` via :

```bash
npx supabase gen types typescript --project-id qaannbudahqalupwhufp --schema public > app/types/database.types.ts
```
