# Edit Resource Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un bouton conditionnel « Éditer » sur les pages publiques de datasets, applications, reuses, news et events du portail, qui ouvre la page d'administration correspondante du back-office.

**Architecture:** Un composable `useBackOfficeUrl` (extrait du menu perso) calcule l'URL du BO. Un composable `useEditResourceLink` calcule la visibilité du bouton — pour datasets/applications via un fetch léger client-only sur `userPermissions` ; pour les ressources portails via un check local (portal owner + rôle admin). Un composant `<edit-resource-btn>` encapsule l'action-btn avec i18n et couleur primaire. Le bouton est intégré dans les composants/pages de chaque type.

**Tech Stack:** Nuxt 3 (Vue 3 composition API), Vuetify 3, `@data-fair/lib-vue` (session), TypeScript, Playwright e2e.

**Spec:** `docs/superpowers/specs/2026-04-30-edit-link-on-resource-pages-design.md`

**Commits:** 4 commits logiques (squash-ready). Pas de commit par micro-étape.

---

## File Structure

**Created:**
- `portal/app/composables/use-back-office-url.ts` — calcule l'URL du BO (réutilisé par menu perso et bouton Éditer)
- `portal/app/composables/use-edit-resource-link.ts` — calcule visibilité + URL pour chaque type
- `portal/app/components/edit-resource-btn.vue` — composant bouton

**Modified:**
- `portal/server/routes/portal/api/pages/[type]/[slug]/index.get.ts` — ajouter `_id` dans la projection et le retour
- `portal/app/components/layout/layout-personal-menu.vue` — utiliser `useBackOfficeUrl`
- `portal/app/components/dataset/dataset-metadata.vue` — ajouter le bouton
- `portal/app/components/application/application-metadata.vue` — ajouter le bouton
- `portal/app/components/reuse/reuse-preview.vue` — ajouter le bouton (et `pages/reuses/[slug].vue` pour passer l'_id)
- `portal/app/pages/news/[slug].vue` — ajouter le bouton + ajuster le typage du fetch
- `portal/app/pages/event/[slug].vue` — ajouter le bouton + ajuster le typage du fetch

**Tests:**
- `tests/e2e/edit-resource-button.e2e.spec.ts` — e2e Playwright (visibilité conditionnelle)

---

## Task 1: Foundation — `useBackOfficeUrl` + exposer `_id` sur les pages

**Files:**
- Create: `portal/app/composables/use-back-office-url.ts`
- Modify: `portal/app/components/layout/layout-personal-menu.vue`
- Modify: `portal/server/routes/portal/api/pages/[type]/[slug]/index.get.ts`

- [ ] **Step 1: Créer le composable `useBackOfficeUrl`**

`portal/app/composables/use-back-office-url.ts` :

```ts
import type { ComputedRef } from 'vue'

/**
 * Returns the URL prefix for the back-office (without trailing slash).
 * Mirrors the logic used in layout-personal-menu for the "Back-office" link.
 */
export const useBackOfficeUrl = (): ComputedRef<string> => {
  const { siteInfo } = usePortalStore()
  const requestUrl = useRequestURL()

  return computed(() => {
    if (siteInfo.authMode === 'onlyBackOffice' || siteInfo.authMode === 'onlyOtherSite') {
      return `${requestUrl.protocol}//${siteInfo.authOnlyOtherSite}/data-fair`
    }
    return '/data-fair'
  })
}
```

Pas de slash final — les consommateurs ajoutent `/dataset/...`.

- [ ] **Step 2: Refactor `layout-personal-menu.vue`**

Remplacer le bloc `backOfficeUrl` (lignes ~122-129) :

```ts
let backOfficeUrl: ComputedRef<string>
if (!preview) {
  isPortalOwner = computed(() => {
    const account = session.account.value
    if (!account || !portal.value.owner) return false
    return (
      account.type === portal.value.owner.type &&
      account.id === portal.value.owner.id
    )
  })

  const baseBackOfficeUrl = useBackOfficeUrl()
  backOfficeUrl = computed(() => `${baseBackOfficeUrl.value}/`)
}
```

(On conserve le slash final dans le menu perso car il pointe sur la racine du BO.)

- [ ] **Step 3: Exposer `_id` dans l'API pages**

Dans `portal/server/routes/portal/api/pages/[type]/[slug]/index.get.ts`, modifier la projection et le retour :

```ts
const page = await portalMongo.pages.findOne<Pick<Page, '_id' | 'config'>>(
  mongoQuery,
  { projection: { _id: 1, config: 1 } }
)

if (!page) throw createError({ status: 404, message: 'Page not found' })
return { _id: page._id, ...page.config }
```

(On aplatit `config` au top-level pour ne pas casser la structure consommée par les pages news/event, et on ajoute `_id`.)

- [ ] **Step 4: Mettre à jour le typage côté client (news/event)**

Dans `portal/app/pages/news/[slug].vue` et `portal/app/pages/event/[slug].vue`, modifier la ligne du fetch :

```ts
const pageConfigFetch = await useFetch<PageConfig & { _id: string }>(`/portal/api/pages/news/${slug}`, { watch: false })
```

(idem pour `event`).

- [ ] **Step 5: Vérifier**

Run: `npm run check-types && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add portal/app/composables/use-back-office-url.ts \
        portal/app/components/layout/layout-personal-menu.vue \
        portal/server/routes/portal/api/pages \
        portal/app/pages/news \
        portal/app/pages/event
git commit -m "feat(portal): add useBackOfficeUrl composable and expose page _id"
```

---

## Task 2: Composable `useEditResourceLink` + composant `<edit-resource-btn>`

**Files:**
- Create: `portal/app/composables/use-edit-resource-link.ts`
- Create: `portal/app/components/edit-resource-btn.vue`

- [ ] **Step 1: Créer le composable**

`portal/app/composables/use-edit-resource-link.ts` :

```ts
import type { ComputedRef, Ref } from 'vue'

type DataFairKind = 'dataset' | 'application'
type PortalKind = 'reuse' | 'page'
type ResourceKind = DataFairKind | PortalKind

interface ResourceShape {
  id?: string
  _id?: string
}

interface UseEditResourceLinkResult {
  visible: ComputedRef<boolean>
  href: ComputedRef<string>
}

const isDataFairKind = (k: ResourceKind): k is DataFairKind => k === 'dataset' || k === 'application'

export const useEditResourceLink = (
  kind: ResourceKind,
  resource: Ref<ResourceShape | null | undefined>
): UseEditResourceLinkResult => {
  const session = useSession()
  const baseBackOfficeUrl = useBackOfficeUrl()

  const resourceId = computed(() => resource.value?.id ?? resource.value?._id ?? '')

  const href = computed(() => {
    if (!resourceId.value) return ''
    return `${baseBackOfficeUrl.value}/${kind}/${resourceId.value}`
  })

  if (isDataFairKind(kind)) {
    // Client-only fetch of userPermissions, only when a session exists.
    const userPermissions = ref<string[]>([])
    if (import.meta.client) {
      watchEffect(async () => {
        userPermissions.value = []
        if (!session.user.value || !resourceId.value) return
        try {
          const data = await $fetch<{ userPermissions?: string[] }>(
            `/data-fair/api/v1/${kind}s/${resourceId.value}`,
            { query: { select: 'id,userPermissions' } }
          )
          userPermissions.value = data.userPermissions ?? []
        } catch {
          userPermissions.value = []
        }
      })
    }
    const visible = computed(() => userPermissions.value.includes('writeDescription'))
    return { visible, href }
  }

  // Portal-only kinds (reuse, page): owner is always the portal owner.
  const { portal } = usePortalStore()
  const visible = computed(() => {
    if (!session.user.value) return false
    const account = session.account.value
    const owner = portal.value.owner
    if (!account || !owner) return false
    if (account.type !== owner.type || account.id !== owner.id) return false
    return session.accountRole.value === 'admin'
  })

  return { visible, href }
}
```

- [ ] **Step 2: Créer le composant**

`portal/app/components/edit-resource-btn.vue` :

```vue
<template>
  <v-btn
    v-if="link.visible.value"
    :href="link.href.value"
    target="_blank"
    rel="noopener"
    color="primary"
    variant="elevated"
    size="small"
    :prepend-icon="mdiPencil"
  >
    {{ t('edit') }}
  </v-btn>
</template>

<script setup lang="ts">
import { mdiPencil } from '@mdi/js'

const props = defineProps<{
  kind: 'dataset' | 'application' | 'reuse' | 'page'
  resource: { id?: string; _id?: string } | null | undefined
}>()

const { t } = useI18n()
const link = useEditResourceLink(props.kind, toRef(props, 'resource'))
</script>

<i18n lang="yaml">
  en:
    edit: Edit
  fr:
    edit: Éditer
</i18n>
```

Note : on utilise un `v-btn` direct plutôt qu'`action-btn` pour garantir le support de `href`/`target="_blank"`. Si à l'inspection action-btn supporte déjà ces props, l'utiliser pour la cohérence visuelle avec les autres boutons.

- [ ] **Step 3: Vérifier**

Run: `npm run check-types && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add portal/app/composables/use-edit-resource-link.ts \
        portal/app/components/edit-resource-btn.vue
git commit -m "feat(portal): add useEditResourceLink composable and edit-resource-btn component"
```

---

## Task 3: Intégrer le bouton dans les 5 pages

**Files:**
- Modify: `portal/app/components/dataset/dataset-metadata.vue`
- Modify: `portal/app/components/application/application-metadata.vue`
- Modify: `portal/app/components/reuse/reuse-preview.vue`
- Modify: `portal/app/pages/reuses/[slug].vue` (passer `_id` en prop)
- Modify: `portal/app/pages/news/[slug].vue`
- Modify: `portal/app/pages/event/[slug].vue`

- [ ] **Step 1: Dataset**

Dans `portal/app/components/dataset/dataset-metadata.vue`, juste après `<dataset-notifications />` et avant la fin de la `<v-col>` (vers ligne 230) :

```vue
<edit-resource-btn
  kind="dataset"
  :resource="dataset"
/>
```

- [ ] **Step 2: Application**

Dans `portal/app/components/application/application-metadata.vue`, à la fin de la rangée d'actions (juste après `<application-install />`) :

```vue
<edit-resource-btn
  kind="application"
  :resource="application"
/>
```

- [ ] **Step 3: Reuse — passer l'`_id` en prop**

Dans `portal/app/pages/reuses/[slug].vue`, ajouter la prop `reuse-id` :

```vue
<reuse-preview
  v-else-if="reuseConfig && reuseFetch.data.value"
  :reuse-id="reuseFetch.data.value._id"
  :reuse-config="reuseConfig"
  :slug="slug"
  :reuses-catalog-exists="reusesCatalogExists"
/>
```

Dans `portal/app/components/reuse/reuse-preview.vue`, accepter la prop :

```ts
const { reuseId, reuseConfig, slug, reusesCatalogExists } = defineProps<{
  reuseId: string
  reuseConfig: ReuseConfig
  slug: string
  reusesCatalogExists?: boolean
}>()
```

(Conserver les props existantes — n'ajouter que `reuseId`.)

Dans le template de `reuse-preview.vue`, dans la rangée titre `<div class="d-flex align-center">` (lignes 2-25), juste après `<nav-link>` du lien externe et avant la fermeture du `<div>` :

```vue
<edit-resource-btn
  kind="reuse"
  :resource="{ _id: reuseId }"
  class="ml-2"
/>
```

- [ ] **Step 4: News page**

Dans `portal/app/pages/news/[slug].vue`, modifier le template :

```vue
<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <page-error
      v-if="pageConfigFetch.error.value"
      :status-code="pageConfigFetch.error.value.statusCode || 500"
      :title="errorTitle"
      :link="{
        type: 'standard',
        subtype: 'news-catalog',
        title: t('backToNews')
      }"
    />

    <template v-else-if="pageConfigFetch.data.value">
      <div class="d-flex justify-end mb-2">
        <edit-resource-btn
          kind="page"
          :resource="pageConfigFetch.data.value"
        />
      </div>
      <page-elements :model-value="pageConfigFetch.data.value.elements" />
    </template>
  </layout-page>
</template>
```

- [ ] **Step 5: Event page**

Idem dans `portal/app/pages/event/[slug].vue` (remplacer `news` par `event` partout, conserver les liens existants).

- [ ] **Step 6: Vérifier**

Run: `npm run check-types && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add portal/app/components/dataset/dataset-metadata.vue \
        portal/app/components/application/application-metadata.vue \
        portal/app/components/reuse/reuse-preview.vue \
        portal/app/pages/reuses \
        portal/app/pages/news \
        portal/app/pages/event
git commit -m "feat(portal): add edit button on dataset, application, reuse, news and event pages"
```

---

## Task 4: Test e2e Playwright

**Files:**
- Create: `tests/e2e/edit-resource-button.e2e.spec.ts`

- [ ] **Step 1: Inspecter les fixtures existantes**

```bash
ls tests/e2e/ | head
cat tests/fixtures/portal.ts | head -80
ls tests/e2e/*.e2e.spec.ts | head -3 | xargs -I {} sh -c 'echo "=== {} ==="; head -40 {}'
```

But : comprendre les utilisateurs test, le portail seed, comment authentifier un admin et un visiteur anonyme, et les ressources seed disponibles (datasets, reuses).

- [ ] **Step 2: Écrire le test (squelette à adapter aux fixtures)**

`tests/e2e/edit-resource-button.e2e.spec.ts` :

```ts
import { test, expect } from '../fixtures/portal'

test.describe('Edit resource button', () => {
  test('hidden for anonymous on dataset page', async ({ page, portalUrl, datasetSlug }) => {
    await page.goto(`${portalUrl}/datasets/${datasetSlug}`)
    await expect(page.getByRole('link', { name: /Éditer|Edit/ })).toHaveCount(0)
  })

  test('visible to admin owner on dataset page, opens BO', async ({ adminPage, portalUrl, datasetSlug }) => {
    await adminPage.goto(`${portalUrl}/datasets/${datasetSlug}`)
    const link = adminPage.getByRole('link', { name: /Éditer|Edit/ })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', /\/data-fair\/dataset\//)
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('visible to admin on reuse page', async ({ adminPage, portalUrl, reuseSlug }) => {
    await adminPage.goto(`${portalUrl}/reuses/${reuseSlug}`)
    const link = adminPage.getByRole('link', { name: /Éditer|Edit/ })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', /\/data-fair\/reuse\//)
  })
})
```

(Adapter les noms de fixtures selon ce qui est réellement exporté par `tests/fixtures/portal.ts`.)

- [ ] **Step 3: Lancer le test ciblé**

Run: `npm test -- tests/e2e/edit-resource-button.e2e.spec.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/edit-resource-button.e2e.spec.ts
git commit -m "test(portal): cover edit resource button visibility"
```

---

## Task 5: Validation manuelle finale (no commit)

- [ ] **Step 1: Démarrage du portail dev**

L'utilisateur démarre le dev (zellij) et teste les 5 types de pages.

- [ ] **Step 2: Matrice de validation**

Pour chaque type (dataset, application, reuse, news, event) :
- Anonyme : bouton absent.
- Connecté non-admin : bouton absent.
- Connecté admin de l'owner : bouton visible, primaire, ouvre la bonne URL BO en nouvel onglet.
- Multi-comptes : bouton apparaît/disparaît au changement d'account courant.

- [ ] **Step 3: Vérifier qu'il n'y a pas de régression de cache SSR**

Charger une page dataset en visiteur anonyme, vérifier (DevTools Network) qu'aucune requête `/data-fair/api/v1/datasets/...?select=id,userPermissions` n'est envoyée.

---

## Notes d'exécution

- **Ne pas démarrer/redémarrer les services** — l'utilisateur gère son env dev (zellij).
- **Lancer uniquement les tests ciblés** pendant l'itération ; le full suite tourne au push via husky.
- **Lint + typecheck** systématiquement avant chaque commit (Task 1, 2, 3 : pas de commit si rouge).
- En cas de doute sur l'API d'un composant existant (notamment `action-btn`), lire le source avant d'écrire l'usage.
- **4 commits totaux** (Task 1-4) — squash-friendly.
