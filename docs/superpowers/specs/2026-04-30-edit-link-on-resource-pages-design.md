# Bouton « Éditer » conditionnel sur les pages de ressources du portail

Date : 2026-04-30
Périmètre : `portal/` (Nuxt portail public)

## Objectif

Ajouter un bouton « Éditer » dans la card de métadonnées des pages publiques de ressources du portail :

- Dataset : `pages/datasets/[ref]/index.vue`
- Application : `pages/applications/[ref]/index.vue`
- Reuse : `pages/reuses/[slug].vue`
- News : `pages/news/[slug].vue`
- Event : `pages/event/[slug].vue`

Le bouton est placé dans la même rangée que les boutons d'action existants (Tableau, API, Téléchargement, etc.). Il est rendu en `color="primary"` pour se distinguer visuellement, et n'est affiché que si l'utilisateur courant a effectivement le droit d'éditer la ressource dans le back-office.

Le clic ouvre dans un nouvel onglet la page d'administration correspondante du back-office (data-fair pour les datasets/applications, portails-manager pour les pages/reuses).

## Conditions de visibilité

Deux familles de règles, selon la provenance de la ressource :

### Datasets et applications (gérés par data-fair)

Calque exact de la condition utilisée par data-fair pour afficher son propre bouton « Éditer » (`data-fair/ui/src/components/dataset/metadata/dataset-metadata-view.vue` : `v-if="can('writeDescription').value"`).

- L'API data-fair calcule un champ `userPermissions: string[]` par ressource (`api/src/datasets/utils/index.js:159`), filtrable via `select`.
- Aujourd'hui le portail exclut explicitement ce champ (`-userPermissions` dans le `select` des fetches détail).
- Le bouton est visible si `userPermissions.includes('writeDescription')`.

### Reuses, news, events (gérés par l'API portails)

Aucun champ `userPermissions` ; les permissions sont purement basées sur le rôle de compte (cf. `api/src/reuses/router.ts:17,81` : `assertAccountRole(session, resource.owner, 'admin')`).

Le bouton est visible si toutes ces conditions sont vraies :

1. L'utilisateur est connecté.
2. `session.account.type === resource.owner.type && session.account.id === resource.owner.id` (et `department` aligné si présent).
3. `session.accountRole === 'admin'`.

News et events sont stockés en tant que `pages` dans l'API portails (`portal/api/pages/...`), donc un seul mécanisme couvre les trois.

## Cible des liens

L'URL de base du back-office est calculée **avec la même logique que `backOfficeUrl` dans `layout-personal-menu.vue:124`**, qui gère les modes d'authentification (`onlyBackOffice`, `onlyOtherSite`) et tombe par défaut sur `/data-fair/`.

Cette logique est extraite dans un composable partagé `useBackOfficeUrl()` pour être réutilisable.

| Ressource    | URL                                             |
|--------------|-------------------------------------------------|
| Dataset      | `${backOfficeUrl}/dataset/${dataset.id}`        |
| Application  | `${backOfficeUrl}/application/${application.id}`|
| Reuse        | `${backOfficeUrl}/reuses/${reuse.id}`           |
| News / Event / Page | `${backOfficeUrl}/pages/${page.id}`      |

Toutes les ouvertures se font dans un nouvel onglet (`target="_blank" rel="noopener"`).

## Architecture

### 1. Composable `useBackOfficeUrl()`

Extrait depuis `layout-personal-menu.vue`. Retourne une `ComputedRef<string>` représentant le préfixe URL du back-office, sans slash final.

```ts
export const useBackOfficeUrl = (): ComputedRef<string> => { /* ... */ }
```

Utilisé à la fois par le menu personnel (refacto) et par le nouveau composable d'édition.

### 2. Composable `useEditResourceLink()`

```ts
type ResourceKind = 'dataset' | 'application' | 'reuse' | 'page'

export const useEditResourceLink = (
  kind: ResourceKind,
  resource: Ref<{ id: string; owner?: { type: string; id: string; department?: string } }>
): { visible: ComputedRef<boolean>; href: ComputedRef<string> }
```

#### Pour `dataset` et `application`

- Déclenche un `useFetch` côté client (sans SSR : `server: false`) sur `${dataFairUrl}/api/v1/${kind}s/${id}?select=id,userPermissions`, **uniquement** si `session.user` est non-null.
- Lié à `watchEffect` sur la session : si l'utilisateur se connecte/déconnecte, le fetch est ré-évalué.
- `visible` = `userPermissions.includes('writeDescription')`.
- Coût : zéro requête supplémentaire pour les visiteurs anonymes ; une requête légère après hydratation pour les visiteurs connectés.

#### Pour `reuse` et `page`

- Aucun fetch. Calcul purement local depuis `useSession()` :
  - `session.user.value` non-null
  - `session.account.value` correspond à `resource.value.owner`
  - `session.accountRole.value === 'admin'`

### 3. Composant `<edit-resource-btn>`

Wrapper léger autour du `<action-btn>` existant pour partager la logique d'affichage.

```vue
<template>
  <action-btn
    v-if="link.visible.value"
    :href="link.href.value"
    target="_blank"
    rel="noopener"
    color="primary"
    :icon="mdiPencil"
    :resource-title="resourceTitle"
    :text="t('edit')"
  />
</template>
```

i18n FR : `Éditer`, EN : `Edit`.

### 4. Intégration dans les pages

- **`dataset-metadata.vue`** : ajouter `<edit-resource-btn kind="dataset" :resource="dataset" />` dans la rangée d'actions, en dernière position. Pas de gating sur `metadataConfig.actionButtons` (le bouton n'est pas un bouton d'action portail standard).
- **`application-card.vue`** (ou équivalent — à confirmer pendant l'implémentation) : même approche.
- **`reuse-preview.vue`** : ajouter dans la zone d'actions.
- **`news/[slug].vue`** et **`event/[slug].vue`** : ajouter dans la zone de header. Ces pages sont en réalité des `pages` du portail, donc le composant prend le `pageConfig` (qui contient `id` et `owner`) en input.

## Cache & SSR

Le portail rend des pages publiques mises en cache au niveau Nuxt SSR. Pour éviter de casser le cache anonyme :

- **Le fetch `userPermissions`** (datasets/applications) est strictement client-side (`server: false`) et conditionné à la présence d'une session.
- **Le calcul de visibilité portails-only** repose uniquement sur `useSession()`, déjà client-only par nature.

Conséquence : le bouton apparaît avec un léger délai (post-hydratation) pour les utilisateurs connectés. Acceptable car le bouton concerne une minorité d'utilisateurs (administrateurs).

Aucun changement aux `select` des fetches existants : on n'introduit pas `userPermissions` dans le payload SSR.

## Hors périmètre

- Pas de toggle dans la configuration du portail pour activer/désactiver le bouton (toujours actif si la condition est remplie).
- Pas de gestion des brouillons (drafts) : on cible toujours la page principale du back-office, qui présentera les options pertinentes.
- Pas de label personnalisable.
- Pas d'analytics spécifique sur le clic.

## Plan de tests

- **Visiteur anonyme** : le bouton n'apparaît jamais, sur aucun des 5 types. Aucune requête supplémentaire vers data-fair.
- **Utilisateur connecté sans droit** : le bouton n'apparaît pas. Pour les datasets/applications, le fetch est tenté mais `userPermissions` n'inclut pas `writeDescription`.
- **Utilisateur connecté avec droit (admin de l'owner)** : le bouton apparaît après hydratation, le clic ouvre l'URL attendue dans un nouvel onglet.
- **Bascule de compte courant** (multi-comptes via simple-directory) : le bouton apparaît/disparaît dynamiquement.
- **Mode `authMode: onlyOtherSite`** : l'URL pointe vers le domaine externe configuré, pas vers `/data-fair/` local.

Tests automatisés : extension des fixtures Playwright e2e existantes pour couvrir la visibilité du bouton sur dataset et reuse au minimum (les autres types partagent la même logique).
