/**
 * The OpenAPI document of the portals manager, served at /portals-manager/api/api-docs.json.
 *
 * data-fair fetches it over a private url and merges it into its platform document
 * (/data-fair/api/v1/platform/api-docs.json) under the namespace portals: paths prefixed with
 * /portals-manager/api, operationIds and tool names prefixed with portals_. `@data-fair/openapi-mcp`
 * turns the x-agent annotations (x-agent.ts) into agent tools, and a token's OAuth scopes decide
 * which of them it is offered.
 *
 * Built from the scope tables of api/src/scopes.ts: every scoped operation lists the cookie session
 * and one oauth2 alternative per scope it accepts (standard OpenAPI: the scopes of one requirement are
 * all needed). Portals accepts no API keys: no apiKey scheme. Request and response schemas come from
 * api/doc and api/types, their references resolved here; the configurations of portals and pages are
 * too large for a tool, they are edited through editor tool groups whose schemas are served by the
 * draft-config schema routes.
 *
 * The agent-facing surface is pinned by tests/fixtures/agent-surface.json.
 */
import { oauth2SecurityScheme, oauth2Alternatives, type ScopeLocale } from '@data-fair/lib-common-types/scopes.js'
import accountSchema from '@data-fair/lib-common-types/account/schema.js'
import { vocabulary, acceptedScopes, scopedOperations, imageOperations, type ScopedOperationId } from '../src/scopes.ts'
import { operations as agentOperations, root as agentRoot, tagGuides } from './x-agent.ts'
import partialSchema from '../types/partial/schema.js'
import portalSchema from '../types/portal/schema.js'
import portalIngressSchema from '../types/portal-ingress/schema.js'
import pageSchema from '../types/page/schema.js'
import reuseSchema from '../types/reuse/schema.js'
import reuseConfigSchema from '../types/reuse-config/schema.js'
import groupSchema from '../types/group/schema.js'
import fontAssetSchema from '../types/font-asset/schema.js'
import imageSchema from '../types/image/schema.js'
import portalsPostSchema from '../doc/portals/post-req-body/schema.js'
import portalsPatchSchema from '../doc/portals/patch-req-body/schema.js'
import pagesPostSchema from '../doc/pages/post-req-body/schema.ts'
import pagesPatchSchema from '../doc/pages/patch-req-body/schema.ts'
import reusesPostSchema from '../doc/reuses/post-req-body/schema.js'
import reusesPatchSchema from '../doc/reuses/patch-req-body/schema.js'
import groupsPostSchema from '../doc/groups/post-req-body/schema.js'
import groupsPatchSchema from '../doc/groups/patch-req-body/schema.js'
import fontAssetsPostSchema from '../doc/font-assets/post-req-body/schema.js'
import fontAssetsPatchSchema from '../doc/font-assets/patch-req-body/schema.js'

type JsonSchema = Record<string, any>

// the configurations behind an editor tool group, never inlined in a tool
const configPlaceholders: Record<string, JsonSchema> = {
  'https://github.com/data-fair/portals/portal-config': { type: 'object', description: 'The configuration of the portal, edited with the portals_portal_config tools.' },
  'https://github.com/data-fair/portals/page-config': { type: 'object', description: 'The content of the page, edited with the portals_page_config tools.' }
}
const knownSchemas: Record<string, JsonSchema> = Object.fromEntries([accountSchema, partialSchema, portalIngressSchema, reuseConfigSchema].map(s => [s.$id, s]))

const follow = (schema: JsonSchema, pointer: string) => pointer.split('/').filter(Boolean).reduce((node, key) => node?.[key], schema)

/**
 * A copy of a schema for the document: its references inlined (known schemas by $id, local
 * #/$defs/... pointers), the configurations behind an editor replaced by a placeholder, and the keys
 * that only drive the build of the types and of the forms (x-*, layout, $id...) removed.
 */
export const docSchema = (schema: JsonSchema, base: JsonSchema = schema): any => {
  if (Array.isArray(schema)) return schema.map(item => docSchema(item, base))
  if (!schema || typeof schema !== 'object') return schema
  if (typeof schema.$ref === 'string') {
    const [id, pointer = ''] = schema.$ref.split('#')
    if (!id && pointer) return docSchema(follow(base, pointer), base)
    if (configPlaceholders[id]) return { ...configPlaceholders[id] }
    const target = knownSchemas[id]
    if (!target) throw new Error(`api docs: unknown schema reference ${schema.$ref}`)
    return docSchema(follow(target, pointer), target)
  }
  const copy: JsonSchema = {}
  for (const [key, value] of Object.entries(schema)) {
    if (key.startsWith('x-') || ['$id', '$schema', '$defs', 'layout', 'tsType', 'errorMessage'].includes(key)) continue
    if (['default', 'examples', 'const', 'enum'].includes(key)) copy[key] = structuredClone(value)
    // property names are kept whatever they are
    else if (key === 'properties') copy[key] = Object.fromEntries(Object.entries(value as JsonSchema).map(([name, property]) => [name, docSchema(property, base)]))
    else copy[key] = typeof value === 'object' ? docSchema(value, base) : value
  }
  return copy
}

const withProperties = (schema: JsonSchema, properties: JsonSchema, required?: string[]) => ({
  ...schema,
  properties: { ...schema.properties, ...properties },
  ...(required ? { required } : {})
})

// a new portal or page starts with a default configuration: only its title is asked, the rest is
// edited afterwards with the editor tools
const portalPostBody = docSchema(withProperties(portalsPostSchema, {
  config: { type: 'object', required: ['title'], properties: { title: { type: 'string', description: 'Title of the portal.' } } }
}))
const pagePostBody = docSchema(withProperties(pagesPostSchema, {
  type: {
    type: 'string',
    enum: pageSchema.properties.type.enum,
    description: 'generic for a free page, event or news for an event or a news item; the other types are the standard pages and catalogs, one of each per portal.'
  },
  title: { type: 'string', description: 'Title of the page in the back-office lists, config.title when omitted.' },
  config: {
    type: 'object',
    required: ['title', 'elements'],
    properties: {
      title: { type: 'string', description: 'Title of the page.' },
      elements: { type: 'array', items: { type: 'object' }, description: 'The blocks of the page: give an empty list, then build the content with the portals_page_config tools (a catalog page gets its default catalog block).' }
    }
  }
}))
// the font file metadata are read from the upload when the body does not give them
const fontAssetPostSchema: JsonSchema = fontAssetsPostSchema
const { file: _file, ...fontAssetPostProperties } = fontAssetPostSchema.properties
const fontAssetPostBody = docSchema({
  ...fontAssetPostSchema,
  required: fontAssetPostSchema.required.filter((p: string) => p !== 'file'),
  properties: fontAssetPostProperties
})

const listOf = (item: JsonSchema, extra: JsonSchema = {}) => ({
  type: 'object',
  properties: {
    count: { type: 'integer', description: 'Total number of results.' },
    results: { type: 'array', items: item },
    ...extra
  }
})

const schemas = {
  portal: docSchema(portalSchema),
  page: docSchema(pageSchema),
  reuse: docSchema(reuseSchema),
  group: docSchema(groupSchema),
  fontAsset: (() => {
    const schema = docSchema(fontAssetSchema)
    delete schema.properties.data
    schema.required = schema.required.filter((p: string) => p !== 'data')
    return schema
  })(),
  image: (() => {
    const schema = docSchema(imageSchema)
    delete schema.properties.data
    return schema
  })(),
  portalPostBody,
  portalPatchBody: docSchema(portalsPatchSchema),
  pagePostBody,
  pagePatchBody: docSchema(pagesPatchSchema),
  reusePostBody: docSchema(reusesPostSchema),
  reusePatchBody: docSchema(reusesPatchSchema),
  groupPostBody: docSchema(groupsPostSchema),
  groupPatchBody: docSchema(groupsPatchSchema)
}

const ref = (name: keyof typeof schemas) => ({ $ref: `#/components/schemas/${name}` })
const jsonContent = (schema: JsonSchema) => ({ 'application/json': { schema } })
const jsonBody = (schema: JsonSchema, description?: string) => ({ required: true, ...(description ? { description } : {}), content: jsonContent(schema) })
const ok = (description: string, schema?: JsonSchema) => ({ 200: { description, ...(schema ? { content: jsonContent(schema) } : {}) } })
const created = (description: string, schema: JsonSchema) => ({ 201: { description, content: jsonContent(schema) } })
const noContent = (description: string) => ({ 204: { description } })

const idParam = (description: string) => ({ in: 'path', name: 'id', required: true, description, schema: { type: 'string' } })
const paginationParams = [
  { in: 'query', name: 'page', required: false, description: 'Page number, from 1.', schema: { type: 'integer', minimum: 1, default: 1 } },
  { in: 'query', name: 'size', required: false, description: 'Page size.', schema: { type: 'integer', minimum: 0, maximum: 100, default: 10 } }
]
const listParam = (name: string, description: string, items: JsonSchema = { type: 'string' }) => ({
  in: 'query', name, required: false, description, style: 'form', explode: false, schema: { type: 'array', items }
})
const selectParam = { in: 'query', name: 'select', required: false, description: 'Fields to return, separated by commas.', schema: { type: 'string' } }

const scopedSecurity = (operationId: ScopedOperationId) => {
  const { family, tier } = scopedOperations[operationId]
  return [{ sdCookie: [] }, ...oauth2Alternatives(acceptedScopes(family, tier))]
}
// an any-scope route that still needs a session (allowAnyScope, then reqSessionAuthenticated): the
// cookie, or a token whatever its scopes (an oauth2 requirement with no scope)
export const anyScopeSessionSecurity = [{ sdCookie: [] }, { oauth2: [] }]
// an image belongs to a portal, a page or a reuse: the family of its scope is the one of that resource
const imageSecurity = (operationId: keyof typeof imageOperations) => {
  const { families, tier } = imageOperations[operationId]
  return [{ sdCookie: [] }, ...oauth2Alternatives([...new Set(families.flatMap(family => acceptedScopes(family, tier)))])]
}

const operation = (operationId: ScopedOperationId, tag: string, summary: string, spec: JsonSchema) => ({
  operationId,
  summary,
  tags: [tag],
  security: scopedSecurity(operationId),
  ...(agentOperations[operationId] ? { 'x-agent': agentOperations[operationId] } : {}),
  ...spec
})

const pageTypes: string[] = pageSchema.properties.type.enum

const paths = {
  '/portals': {
    get: operation('listPortals', 'Portals', 'List portals', {
      parameters: [...paginationParams, selectParam],
      responses: ok('The portals of the active account.', listOf(ref('portal')))
    }),
    post: operation('createPortal', 'Portals', 'Create a portal', {
      requestBody: jsonBody(ref('portalPostBody')),
      responses: created('The new portal.', ref('portal'))
    })
  },
  '/portals/{id}': {
    get: operation('getPortal', 'Portals', 'Get a portal', {
      parameters: [idParam('Id of the portal.')],
      responses: ok('The portal.', ref('portal'))
    }),
    patch: operation('updatePortal', 'Portals', 'Update a portal', {
      description: 'owner, staging and contributorDepartments need the admin tier.',
      parameters: [idParam('Id of the portal.')],
      requestBody: jsonBody(ref('portalPatchBody')),
      responses: ok('The updated portal.', ref('portal'))
    }),
    delete: operation('deletePortal', 'Portals', 'Delete a portal', {
      parameters: [idParam('Id of the portal.')],
      responses: noContent('Deleted.')
    })
  },
  '/portals/{id}/public': {
    get: {
      operationId: 'getPublicPortal',
      summary: 'Get the public information of a portal',
      tags: ['Portals'],
      security: [],
      parameters: [idParam('Id of the portal.')],
      responses: ok('Its id, title, owner and url.', {
        type: 'object',
        properties: { _id: { type: 'string' }, title: { type: 'string' }, owner: schemas.portal.properties.owner, url: { type: 'string' } }
      })
    }
  },
  '/portals/{id}/draft': {
    post: operation('publishPortalDraft', 'Portals', 'Publish the draft configuration of a portal', {
      parameters: [idParam('Id of the portal.')],
      responses: noContent('Published.')
    }),
    delete: operation('cancelPortalDraft', 'Portals', 'Discard the draft configuration of a portal', {
      parameters: [idParam('Id of the portal.')],
      responses: noContent('Discarded.')
    })
  },
  '/portals/{id}/draft-config': {
    get: operation('getPortalDraftConfig', 'Portals', 'Get the draft configuration of a portal', {
      parameters: [idParam('Id of the portal.')],
      responses: ok('The draft configuration, as the PUT accepts it.', { type: 'object' })
    }),
    put: operation('putPortalDraftConfig', 'Portals', 'Replace the draft configuration of a portal', {
      parameters: [idParam('Id of the portal.')],
      requestBody: jsonBody({ type: 'object' }, 'The whole draft configuration, valid against the schema of GET /portals/{id}/draft-config/schema.'),
      responses: ok('The saved draft configuration.', { type: 'object' })
    })
  },
  '/portals/{id}/draft-config/schema': {
    get: operation('getPortalConfigSchema', 'Portals', 'Get the JSON Schema of the configuration of a portal', {
      parameters: [idParam('Id of the portal.')],
      responses: ok('A self-contained JSON Schema, with its form layout.', { type: 'object' })
    })
  },
  '/font-assets': {
    get: operation('listFontAssets', 'Fonts', 'List font files', {
      responses: ok('The font files of the active account.', listOf(ref('fontAsset')))
    }),
    post: operation('createFontAsset', 'Fonts', 'Upload a font file', {
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['body', 'font-asset'],
              properties: {
                body: fontAssetPostBody,
                'font-asset': { type: 'string', format: 'binary', description: 'The font file: WOFF2 (variable), OTF or TTF.' }
              }
            },
            encoding: { 'font-asset': { contentType: 'font/woff2, font/otf, font/ttf, application/octet-stream' } }
          }
        }
      },
      responses: ok('The new font file.', ref('fontAsset'))
    })
  },
  '/font-assets/{id}': {
    patch: operation('updateFontAsset', 'Fonts', 'Update a font file', {
      parameters: [idParam('Id of the font file.')],
      requestBody: jsonBody(docSchema(fontAssetsPatchSchema)),
      responses: ok('The updated font file.', ref('fontAsset'))
    }),
    delete: operation('deleteFontAsset', 'Fonts', 'Delete a font file', {
      parameters: [idParam('Id of the font file.')],
      responses: noContent('Deleted.')
    })
  },
  '/font-assets/{id}/data/{filename}': {
    get: operation('getFontAssetData', 'Fonts', 'Download a font file', {
      parameters: [idParam('Id of the font file.'), { in: 'path', name: 'filename', required: true, description: 'Any file name.', schema: { type: 'string' } }],
      responses: { 200: { description: 'The font file.', content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } } } }
    })
  },
  '/fonts': {
    get: {
      operationId: 'listFonts',
      summary: 'List the font families available to the active account',
      tags: ['Fonts'],
      security: anyScopeSessionSecurity,
      responses: ok('The names of the font families.', { type: 'array', items: { type: 'string' } })
    }
  },
  '/images': {
    post: {
      operationId: 'createImage',
      summary: 'Upload an image',
      description: 'The scope family is the one of the image\'s resource: portals for a portal image, pages for a page image, reuses for a reuse image, at the write tier.',
      tags: ['Images'],
      security: imageSecurity('createImage'),
      'x-agent': agentOperations.createImage,
      parameters: [
        { in: 'query', name: 'width', required: false, description: 'Width to resize the image to.', schema: { type: 'integer', minimum: 1 } },
        { in: 'query', name: 'height', required: false, description: 'Height to resize the image to.', schema: { type: 'integer', minimum: 1 } }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['body', 'image'],
              properties: {
                body: {
                  type: 'object',
                  required: ['resource'],
                  properties: { resource: { ...schemas.image.properties.resource, description: 'The portal, page or reuse the image belongs to.' } }
                },
                image: { type: 'string', format: 'binary', description: 'The image file.' }
              }
            },
            encoding: { image: { contentType: 'image/png, image/jpeg, image/webp, image/gif, image/svg+xml' } }
          }
        }
      },
      responses: ok('The new image, without its data.', ref('image'))
    }
  },
  '/images/{id}/data': {
    get: {
      operationId: 'getImageData',
      summary: 'Download an image',
      description: 'The scope family is the one of the image\'s resource (portals, pages or reuses), at the read tier.',
      tags: ['Images'],
      security: imageSecurity('getImageData'),
      parameters: [idParam('Id of the image.')],
      responses: { 200: { description: 'The image file.', content: { 'image/*': { schema: { type: 'string', format: 'binary' } } } } }
    }
  },
  '/pages': {
    get: operation('listPages', 'Pages', 'List pages', {
      parameters: [
        { in: 'query', name: 'q', required: false, description: 'Full-text search.', schema: { type: 'string' } },
        listParam('type', 'Page types to keep.', { type: 'string', enum: pageTypes }),
        listParam('portal', 'Ids of the portals the pages are attached to.'),
        ...paginationParams,
        selectParam
      ],
      responses: ok('The pages of the active account.', listOf(ref('page'), { facets: { type: 'object', description: 'Counts per type, portal, group and owner.' } }))
    }),
    post: operation('createPage', 'Pages', 'Create a page', {
      description: 'portals needs the admin tier.',
      requestBody: jsonBody(ref('pagePostBody')),
      responses: created('The new page.', ref('page'))
    })
  },
  '/pages/{id}': {
    get: operation('getPage', 'Pages', 'Get a page', {
      parameters: [idParam('Id of the page.')],
      responses: ok('The page.', ref('page'))
    }),
    patch: operation('updatePage', 'Pages', 'Update a page', {
      description: 'portals, requestedPortals and owner need the admin tier.',
      parameters: [idParam('Id of the page.')],
      requestBody: jsonBody(ref('pagePatchBody')),
      responses: ok('The updated page.', ref('page'))
    }),
    delete: operation('deletePage', 'Pages', 'Delete a page', {
      parameters: [idParam('Id of the page.')],
      responses: noContent('Deleted.')
    })
  },
  '/pages/{id}/draft': {
    post: operation('publishPageDraft', 'Pages', 'Publish the draft of a page', {
      parameters: [idParam('Id of the page.')],
      responses: noContent('Published.')
    }),
    delete: operation('cancelPageDraft', 'Pages', 'Discard the draft of a page', {
      parameters: [idParam('Id of the page.')],
      responses: noContent('Discarded.')
    })
  },
  '/pages/{id}/preview': {
    get: operation('previewPage', 'Pages', 'Preview a page', {
      description: 'Renders the page as the calling user (a short-lived read-only session of the same account) and returns a screenshot with a report of the render. The draft is rendered as the page editor previews it, the published page on its portal. The number of renders per user is limited (429, see Retry-After).',
      parameters: [
        idParam('Id of the page.'),
        { in: 'query', name: 'portal', required: false, description: 'The portal whose theme the preview uses (draft) or that serves the page (draft=false), one of those the page is attached to or requested on (default: the first of its portals, else the first portal it is requested on).', schema: { type: 'string' } },
        { in: 'query', name: 'draft', required: false, description: 'Render the draft of the page as the page editor previews it (blocks with the theme of the portal, without header and footer, placeholder items in catalogs) instead of the published page on the portal. The published page needs the page to be attached to the portal.', schema: { type: 'boolean', default: true } },
        { in: 'query', name: 'viewport', required: false, description: 'Size of the simulated screen.', schema: { type: 'string', enum: ['desktop', 'mobile'], default: 'desktop' } },
        { in: 'query', name: 'fullPage', required: false, description: 'Capture the whole height of the page instead of the visible screen only. Off by default: a tall capture is shrunk before you see it, so its text becomes hard to read; the accessibility snapshot covers the whole page either way (shortened when very long).', schema: { type: 'boolean', default: false } }
      ],
      responses: ok('The screenshot and the report of the render.', {
        type: 'object',
        required: ['image', 'text', 'report'],
        properties: {
          image: {
            type: 'object',
            required: ['data', 'mediaType'],
            properties: {
              data: { type: 'string', description: 'The image, base64 encoded.' },
              mediaType: { type: 'string', description: 'Type of the image, for example image/png.' }
            }
          },
          text: { type: 'string', description: 'Readable report: page, console errors, failed requests and accessibility snapshot of the page. Console warnings are only counted: they are noise, not a problem of the page.' },
          report: { type: 'object', description: 'Structured report of the render (url, finalUrl, verdict, blockedFrames, failedRequests...).', additionalProperties: true }
        }
      })
    })
  },
  '/pages/{id}/draft-config': {
    get: operation('getPageDraftConfig', 'Pages', 'Get the draft configuration of a page', {
      parameters: [idParam('Id of the page.')],
      responses: ok('The draft configuration, as the PUT accepts it.', { type: 'object' })
    }),
    put: operation('putPageDraftConfig', 'Pages', 'Replace the draft configuration of a page', {
      parameters: [idParam('Id of the page.')],
      requestBody: jsonBody({ type: 'object' }, 'The whole draft configuration, valid against the schema of GET /pages/{id}/draft-config/schema. An unknown top-level property is refused (400 naming it); properties of an element the schema does not know are dropped, as the page editors heal a draft. The response is the document saved.'),
      responses: ok('The saved draft configuration.', { type: 'object' })
    })
  },
  '/pages/{id}/draft-config/schema': {
    get: operation('getPageConfigSchema', 'Pages', 'Get the JSON Schema of the configuration of a page', {
      parameters: [idParam('Id of the page.')],
      responses: ok('A self-contained JSON Schema for the type of the page, with its form layout.', { type: 'object' })
    })
  },
  '/groups': {
    get: operation('listGroups', 'Page groups', 'List page groups', {
      responses: ok('The page groups of the active account.', listOf(ref('group')))
    }),
    post: operation('createGroup', 'Page groups', 'Create a page group', {
      requestBody: jsonBody(ref('groupPostBody')),
      responses: created('The new group.', ref('group'))
    })
  },
  '/groups/{id}': {
    get: operation('getGroup', 'Page groups', 'Get a page group', {
      parameters: [idParam('Id of the group.')],
      responses: ok('The group.', ref('group'))
    }),
    patch: operation('updateGroup', 'Page groups', 'Update a page group', {
      parameters: [idParam('Id of the group.')],
      requestBody: jsonBody(ref('groupPatchBody')),
      responses: ok('The updated group.', ref('group'))
    }),
    delete: operation('deleteGroup', 'Page groups', 'Delete a page group', {
      parameters: [idParam('Id of the group.')],
      responses: noContent('Deleted.')
    })
  },
  '/reuses': {
    get: operation('listReuses', 'Reuses', 'List reuses', {
      parameters: [
        { in: 'query', name: 'q', required: false, description: 'Full-text search.', schema: { type: 'string' } },
        listParam('portal', 'Ids of the portals the reuses are attached to.'),
        ...paginationParams,
        selectParam
      ],
      responses: ok('The reuses of the active account.', listOf(ref('reuse'), { facets: { type: 'object', description: 'Counts per portal.' } }))
    }),
    post: operation('createReuse', 'Reuses', 'Create a reuse', {
      description: 'portals needs the admin tier.',
      requestBody: jsonBody(ref('reusePostBody')),
      responses: created('The new reuse.', ref('reuse'))
    })
  },
  '/reuses/{id}': {
    get: operation('getReuse', 'Reuses', 'Get a reuse', {
      parameters: [idParam('Id of the reuse.')],
      responses: ok('The reuse.', ref('reuse'))
    }),
    patch: operation('updateReuse', 'Reuses', 'Update a reuse', {
      description: 'config (the live configuration), portals, requestedPortals and owner need the admin tier.',
      parameters: [idParam('Id of the reuse.')],
      requestBody: jsonBody(ref('reusePatchBody')),
      responses: ok('The updated reuse.', ref('reuse'))
    }),
    delete: operation('deleteReuse', 'Reuses', 'Delete a reuse', {
      parameters: [idParam('Id of the reuse.')],
      responses: noContent('Deleted.')
    })
  },
  '/reuses/{id}/draft': {
    post: operation('publishReuseDraft', 'Reuses', 'Publish the draft of a reuse', {
      parameters: [idParam('Id of the reuse.')],
      responses: noContent('Published.')
    }),
    delete: operation('cancelReuseDraft', 'Reuses', 'Discard the draft of a reuse', {
      parameters: [idParam('Id of the reuse.')],
      responses: noContent('Discarded.')
    })
  },
  '/reuses/{id}/submit': {
    post: operation('submitReuse', 'Reuses', 'Submit a reuse to a portal', {
      parameters: [idParam('Id of the reuse.')],
      requestBody: jsonBody({
        type: 'object',
        required: ['portalId'],
        properties: { portalId: { type: 'string', description: 'Id of the portal to submit the reuse to. The portal must accept reuses from its users.' } }
      }),
      responses: noContent('Submitted.')
    })
  },
  '/scopes.json': {
    get: {
      operationId: 'getScopes',
      summary: 'The OAuth scopes of the service, with their descriptions',
      tags: ['Service'],
      security: [],
      responses: ok('Descriptions by scope, in the language of Accept-Language.', { type: 'object', additionalProperties: { type: 'string' } })
    }
  }
}

const tags = [
  { name: 'Portals', description: 'Data portals: their settings and their configuration (theme, header, menu, footer...).' },
  { name: 'Pages', description: 'The pages of the portals: home, catalogs, standard pages, events, news and free pages.' },
  { name: 'Page groups', description: 'Groups of free pages.' },
  { name: 'Reuses', description: 'Reuses of datasets (applications, websites, articles) shown on the portals.' },
  { name: 'Fonts', description: 'The font files of an account, usable in the themes of its portals.' },
  { name: 'Images', description: 'The images of the portals, pages and reuses.' },
  { name: 'Service', description: 'About the service.' }
].map(tag => tag.name in tagGuides ? { ...tag, 'x-agent': { guide: tagGuides[tag.name as keyof typeof tagGuides] } } : tag)

export default (locale: ScopeLocale = 'fr') => ({
  openapi: '3.1.0',
  info: {
    title: 'API Portals manager',
    description: 'The portals of the data-fair platform: their configuration, pages and reuses, for the active account.',
    version: '1.0.0'
  },
  'x-agent': agentRoot,
  // no request origin: data-fair fetches this document over a private url and prefixes the paths itself
  servers: [{ url: '/portals-manager/api' }],
  components: {
    securitySchemes: {
      sdCookie: { type: 'apiKey', in: 'cookie', name: 'id_token' },
      // relative token url, data-fair sets the one of each site
      oauth2: oauth2SecurityScheme(vocabulary, { directoryUrl: '/simple-directory', locale })
    },
    schemas
  },
  tags,
  paths
})
