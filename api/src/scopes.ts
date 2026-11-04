// The OAuth-style scope vocabulary of the portals manager: the portals, pages and reuses families,
// each with the read / write / admin tiers and a bare umbrella, plus the global tier scopes
// all:read / all:write / all:admin shared by every service of the platform.
// A scope-restricted session gets the intersection of its roles and its scopes: the guards below only
// ever refuse, the role checks of the routes (assertAccountRole...) still apply.
// Every session-facing route is guarded by requireOperationScope (scopedOperations), by imageScope
// (imageOperations) or marked allowAnyScope (anyScopeRoutes); any other route refuses scope-restricted
// sessions (lib-express, scopeAware). tests/features/scopes/scopes-coverage.unit.spec.ts checks it.
// The OpenAPI document is built from the same tables.
import type { RequestHandler } from 'express'
import type { ScopeTier } from '@data-fair/lib-common-types/scopes.js'
import { defineScopes, scopeTiers } from '@data-fair/lib-common-types/scopes.js'
import { session, allowAnyScope, httpError } from '@data-fair/lib-express/index.js'

// a guard does not constrain the params of the route it is mounted on (they stay inferred from its path)
type Guard = RequestHandler<any>

export const vocabulary = defineScopes({
  portals: {
    tiers: ['read', 'write', 'admin'],
    descriptions: {
      umbrella: { fr: 'Tous les droits sur les portails', en: 'All portals scopes' },
      read: { fr: 'Lire les portails du compte, leur configuration et leurs polices', en: "Read the account's portals, their configuration and their fonts" },
      write: { fr: 'Modifier le brouillon de configuration des portails du compte et ajouter des polices', en: "Edit the draft configuration of the account's portals and add fonts" },
      admin: { fr: 'Créer, publier et supprimer les portails du compte, gérer leurs propriétaires et départements contributeurs', en: "Create, publish and delete the account's portals, manage their owner and contributor departments" }
    }
  },
  pages: {
    tiers: ['read', 'write', 'admin'],
    descriptions: {
      umbrella: { fr: 'Tous les droits sur les pages', en: 'All pages scopes' },
      read: { fr: 'Lire les pages et les groupes de pages du compte', en: "Read the account's pages and page groups" },
      write: { fr: 'Créer des pages et des groupes de pages, modifier leur brouillon', en: 'Create pages and page groups, edit their draft' },
      admin: { fr: 'Publier et supprimer les pages, choisir les portails où elles sont publiées et leur propriétaire', en: 'Publish and delete pages, choose the portals they are published on and their owner' }
    }
  },
  reuses: {
    tiers: ['read', 'write', 'admin'],
    descriptions: {
      umbrella: { fr: 'Tous les droits sur les réutilisations', en: 'All reuses scopes' },
      read: { fr: 'Lire les réutilisations du compte', en: "Read the account's reuses" },
      write: { fr: 'Créer des réutilisations et modifier leur brouillon', en: 'Create reuses and edit their draft' },
      admin: { fr: 'Publier, soumettre et supprimer les réutilisations, choisir les portails où elles sont publiées et leur propriétaire', en: 'Publish, submit and delete reuses, choose the portals they are published on and their owner' }
    }
  }
})
export const { acceptedScopes, scopeDescriptions } = vocabulary
export type ScopeFamily = typeof vocabulary.families[number]
export type { ScopeTier }

export type ScopedOperation = {
  method: 'get' | 'post' | 'patch' | 'put' | 'delete',
  // relative to /api, OpenAPI style (/pages/{id})
  path: string,
  family: ScopeFamily,
  tier: ScopeTier,
  // body properties that raise the tier when present
  bodyTiers?: Partial<Record<string, ScopeTier>>
}

export const scopedOperations = {
  listPortals: { method: 'get', path: '/portals', family: 'portals', tier: 'read' },
  createPortal: { method: 'post', path: '/portals', family: 'portals', tier: 'admin' },
  getPortal: { method: 'get', path: '/portals/{id}', family: 'portals', tier: 'read' },
  updatePortal: { method: 'patch', path: '/portals/{id}', family: 'portals', tier: 'write', bodyTiers: { owner: 'admin', staging: 'admin', contributorDepartments: 'admin' } },
  deletePortal: { method: 'delete', path: '/portals/{id}', family: 'portals', tier: 'admin' },
  publishPortalDraft: { method: 'post', path: '/portals/{id}/draft', family: 'portals', tier: 'admin' },
  cancelPortalDraft: { method: 'delete', path: '/portals/{id}/draft', family: 'portals', tier: 'write' },
  listFontAssets: { method: 'get', path: '/font-assets', family: 'portals', tier: 'read' },
  createFontAsset: { method: 'post', path: '/font-assets', family: 'portals', tier: 'write' },
  updateFontAsset: { method: 'patch', path: '/font-assets/{id}', family: 'portals', tier: 'write' },
  deleteFontAsset: { method: 'delete', path: '/font-assets/{id}', family: 'portals', tier: 'admin' },
  getFontAssetData: { method: 'get', path: '/font-assets/{id}/data/{filename}', family: 'portals', tier: 'read' },
  listPages: { method: 'get', path: '/pages', family: 'pages', tier: 'read' },
  createPage: { method: 'post', path: '/pages', family: 'pages', tier: 'write', bodyTiers: { portals: 'admin' } },
  getPage: { method: 'get', path: '/pages/{id}', family: 'pages', tier: 'read' },
  updatePage: { method: 'patch', path: '/pages/{id}', family: 'pages', tier: 'write', bodyTiers: { portals: 'admin', requestedPortals: 'admin', owner: 'admin' } },
  deletePage: { method: 'delete', path: '/pages/{id}', family: 'pages', tier: 'admin' },
  publishPageDraft: { method: 'post', path: '/pages/{id}/draft', family: 'pages', tier: 'admin' },
  cancelPageDraft: { method: 'delete', path: '/pages/{id}/draft', family: 'pages', tier: 'write' },
  listGroups: { method: 'get', path: '/groups', family: 'pages', tier: 'read' },
  createGroup: { method: 'post', path: '/groups', family: 'pages', tier: 'write' },
  getGroup: { method: 'get', path: '/groups/{id}', family: 'pages', tier: 'read' },
  updateGroup: { method: 'patch', path: '/groups/{id}', family: 'pages', tier: 'write' },
  deleteGroup: { method: 'delete', path: '/groups/{id}', family: 'pages', tier: 'admin' },
  listReuses: { method: 'get', path: '/reuses', family: 'reuses', tier: 'read' },
  createReuse: { method: 'post', path: '/reuses', family: 'reuses', tier: 'write', bodyTiers: { portals: 'admin' } },
  getReuse: { method: 'get', path: '/reuses/{id}', family: 'reuses', tier: 'read' },
  // config is the live published content: changing it directly is a publication
  updateReuse: { method: 'patch', path: '/reuses/{id}', family: 'reuses', tier: 'write', bodyTiers: { config: 'admin', portals: 'admin', requestedPortals: 'admin', owner: 'admin' } },
  deleteReuse: { method: 'delete', path: '/reuses/{id}', family: 'reuses', tier: 'admin' },
  publishReuseDraft: { method: 'post', path: '/reuses/{id}/draft', family: 'reuses', tier: 'admin' },
  cancelReuseDraft: { method: 'delete', path: '/reuses/{id}/draft', family: 'reuses', tier: 'write' },
  submitReuse: { method: 'post', path: '/reuses/{id}/submit', family: 'reuses', tier: 'admin' }
} satisfies Record<string, ScopedOperation>

export type ScopedOperationId = keyof typeof scopedOperations

// the highest of the declared tier and the tiers of the body properties present
export const operationTier = (operation: ScopedOperation, body: unknown): ScopeTier => {
  let tier = operation.tier
  if (!operation.bodyTiers || !body || typeof body !== 'object') return tier
  for (const [property, propertyTier] of Object.entries(operation.bodyTiers)) {
    if (propertyTier && Object.hasOwn(body, property) && scopeTiers.indexOf(propertyTier) > scopeTiers.indexOf(tier)) tier = propertyTier
  }
  return tier
}

// the scope guard of a route, tagged so the coverage test can tell which route checks what
const scopeGuardKey = Symbol('scope-guard')
const tagGuard = (handler: Guard, tag: string): Guard => Object.assign(handler, { [scopeGuardKey]: tag })
export const scopeGuardOf = (handler: unknown): string | undefined => {
  if (handler === allowAnyScope) return 'any'
  return (handler as any)?.[scopeGuardKey]
}

// first handler of the route, after the body parsers: the tier depends on the body, it must be
// decided before the route reads or writes anything
export const requireOperationScope = (operationId: ScopedOperationId): Guard => {
  const operation: ScopedOperation | undefined = scopedOperations[operationId]
  if (!operation) throw new Error(`unknown scoped operation ${operationId}`)
  return tagGuard(async (req, res, next) => {
    await session.reqWithScope(req, acceptedScopes(operation.family, operationTier(operation, req.body)), res)
    next()
  }, `operation:${operationId}`)
}

// images belong to a portal, a page or a reuse: the family of the scope is the one of that resource
export const imageResourceFamilies: Record<string, ScopeFamily> = { portal: 'portals', page: 'pages', reuse: 'reuses' }

export type ImageOperation = Omit<ScopedOperation, 'family' | 'bodyTiers'> & {
  // the family is the one of the image's resource (imageResourceFamilies), these are the possible ones
  families: ScopeFamily[]
}
export const imageOperations = {
  createImage: { method: 'post', path: '/images', tier: 'write', families: ['portals', 'pages', 'reuses'] },
  getImageData: { method: 'get', path: '/images/{id}/data', tier: 'read', families: ['portals', 'pages', 'reuses'] }
} satisfies Record<string, ImageOperation>

// POST /images: family from body.resource.type (after the multipart parsing), write tier; the
// uploaded file is removed on a refusal.
// GET /images/:id/data: family from the resource of the stored image, read tier.
export const imageScope: Guard = tagGuard(async (req, res, next) => {
  let resourceType: unknown
  if (req.method === 'POST') {
    resourceType = req.body?.resource?.type
  } else {
    // lazy: this module stays importable without the config (unit tests)
    const mongo = (await import('#mongo')).default
    const image = await mongo.images.findOne({ _id: req.params.id as string }, { projection: { resource: 1 } })
    if (!image) throw httpError(404, 'image not found')
    resourceType = image.resource?.type
  }
  const family = typeof resourceType === 'string' ? imageResourceFamilies[resourceType] : undefined
  try {
    if (!family) throw httpError(400, 'unknown image resource type')
    await session.reqWithScope(req, acceptedScopes(family, req.method === 'POST' ? 'write' : 'read'), res)
  } catch (err) {
    if (req.file) {
      const { unlink } = await import('node:fs/promises')
      await unlink(req.file.path).catch(() => {})
    }
    throw err
  }
  next()
}, 'image')

export type ApiRoute = { method: 'get' | 'post' | 'patch' | 'put' | 'delete', path: string }

// routes open to any scope (allowAnyScope): the UIs call them on load and they expose nothing a tier
// would restrict. Paths relative to /api, OpenAPI style.
export const anyScopeRoutes: ApiRoute[] = [
  { method: 'get', path: '/ping' },
  { method: 'get', path: '/scopes.json' },
  { method: 'get', path: '/portals/{id}/public' },
  { method: 'get', path: '/fonts' },
  { method: 'get', path: '/fonts/{name}/css' },
  { method: 'get', path: '/limits/{type}/{id}' }
]

// routes deliberately left without guard nor mark, so refused to scope-restricted sessions (or not
// reading the session at all: secret keys, dev only). A path ending with /* covers the prefix.
export const refusedRoutes: (Omit<ApiRoute, 'method'> & { method: ApiRoute['method'] | '*' })[] = [
  { method: '*', path: '/admin/*' },
  { method: '*', path: '/test-env/*' },
  { method: '*', path: '/identities/*' },
  { method: 'post', path: '/limits/{type}/{id}' },
  { method: 'get', path: '/limits' },
  { method: 'post', path: '/portals/{id}/ingress' }
]
