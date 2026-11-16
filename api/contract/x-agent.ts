/**
 * The x-agent annotations of the portals manager's OpenAPI document (api-docs.ts): which operations
 * become agent tools through `@data-fair/openapi-mcp`, their names, descriptions and views.
 * Vocabulary: docs/x-agent.md and docs/editor-tool-groups.md of openapi-mcp.
 *
 * data-fair merges the document into its platform document, where every tool is named
 * `portals_<name>`: the texts name tools by these platform names. Tool names are a contract (business
 * skills name them), pinned by tests/fixtures/agent-surface.json.
 *
 * An operation whose body properties raise its tier (bodyTiers in api/src/scopes.ts) is split in views,
 * each offering some body fields; the views offering an admin field are narrowed to the admin tier
 * with agentSecurity, so a write token is not offered a tool the API would refuse it.
 */
import type { AgentRoot, AgentOperation } from '@data-fair/openapi-mcp'
import { oauth2Alternatives } from '@data-fair/lib-common-types/scopes.js'
import { acceptedScopes, scopedOperations, type ScopeFamily, type ScopeTier, type ScopedOperationId, type imageOperations } from '../src/scopes.ts'

/** the security of a tool reaching the operation at this tier: the cookie session, or a token holding one of the accepted scopes */
export const agentSecurity = (family: ScopeFamily, tier: ScopeTier) => [{ sdCookie: [] }, ...oauth2Alternatives(acceptedScopes(family, tier))]

const editorTools = (name: string) => ['describeState', 'getData', 'setFieldValue', 'setData', 'getFieldSuggestions', 'editArray', 'saveForm', 'reloadForm'].map(verb => `${name}_${verb}`)

// the bodies are agent-skills/<name>.md, served next to this document (/api/agents/skills/<name>.md).
// A skill is offered while one of its tools is: upload_image is left out of both lists, it would offer
// the portal skill to a pages or reuses token. list_portals and get_portal are left out of the config list for
// the same reason: pages and reuses admin tokens reach them to attach to portals. The page design knowledge (layouts, composition, visual
// review) lives in skills of the platform registry, not here.
export const root: AgentRoot = {
  skills: [{
    name: 'pages',
    description: 'The model of the portal pages and what their schemas do not say: draft and live content, publication and attachment to portals, owners, departments and roles, what a write or an admin token may do, page types and standard pages (home, catalogs, contact, legal pages), slugs, groups and breadcrumbs, uploaded images, the behaviour of the content blocks (titles, table of contents, full width, images, buttons, cards, tabs), embedded applications and iframes, Mermaid diagrams. Read it before creating, editing, publishing, attaching, moving or transferring a page; the form mechanics are in portals-page-config.',
    href: 'agents/skills/pages.md',
    tools: [
      'list_pages', 'get_page', 'create_page', 'create_page_on_portals', 'update_page', 'attach_page_to_portals', 'request_page_publication', 'transfer_page', 'delete_page', 'publish_page', 'preview_portal_page', 'cancel_page_draft',
      ...editorTools('page_config'),
      'list_groups', 'get_group', 'create_group', 'update_group', 'delete_group'
    ]
  }, {
    name: 'config',
    description: 'The model of a portal configuration and what its schema does not say: draft and live configuration, publication, settings (staging, contributor departments, owner), what a write or an admin token may do, the standard pages a new portal lacks, what a save syncs to data-fair and simple-directory and the delays that follow, theme and assisted colours, fonts, images, menu and navigation bar, footer and its mandatory mention, cards and dataset pages whose defaults are not applied, contact, social links, robots and iframe sources. Read it before creating, configuring or publishing a portal; the form mechanics are in portals-portal-config.',
    href: 'agents/skills/config.md',
    tools: [
      'create_portal', 'update_portal_settings', 'delete_portal', 'publish_portal_config', 'cancel_portal_config_draft',
      ...editorTools('portal_config'),
      'list_font_assets', 'upload_font_asset', 'delete_font_asset'
    ]
  }]
}

export const tagGuides = {
  Portals: 'A portal keeps a live configuration and a draft one. The portals_portal_config tools edit the draft as a form (start with portals_portal_config_describeState) and save it at once; portals_publish_portal_config puts the draft live, portals_cancel_portal_config_draft discards it.',
  Pages: 'A page keeps a live configuration and a draft one. Create it with portals_create_page, build its content with the portals_page_config tools (start with portals_page_config_describeState, save with portals_page_config_saveForm), then portals_publish_page puts the draft live. A page is shown on a portal only once attached to it (portals_attach_page_to_portals) and published. The server renders the markdown of the text blocks (_html properties) and the table of contents (_toc) at each save: never write them.',
  Reuses: 'A reuse keeps a live configuration and a draft one: portals_update_reuse edits the draft, portals_publish_reuse puts it live. It is shown on a portal once attached to it (portals_attach_reuse_to_portals).'
}

const idParam = (what: string) => ({ id: { description: `Id of the ${what} (_id).` } })

// Checked labels (openapi-mcp labels): a write naming its target by an opaque id also takes that target's
// title, which the tool reads (with the call's own token) and compares before the call, refusing it on a
// mismatch. The approval card and the agents' reviewer then show what the id names as a checked fact.
// A portal title is read with getPortal, which the pages and reuses admin tiers may call (alsoAccepted in api/src/scopes.ts).
type LabelRead = 'getPortal' | 'getPage' | 'getReuse' | 'getGroup'
const titleLabel = (input: string, name: string, operation: LabelRead) => ({ [input]: { name, operation, field: '/title' } })
const portalLabel = titleLabel('id', 'portalTitle', 'getPortal')
const pageLabel = titleLabel('id', 'pageTitle', 'getPage')
const reuseLabel = titleLabel('id', 'reuseTitle', 'getReuse')
const groupLabel = titleLabel('id', 'groupTitle', 'getGroup')
const portalsLabel = titleLabel('portals', 'portalTitles', 'getPortal')
const requestedPortalsLabel = titleLabel('requestedPortals', 'requestedPortalTitles', 'getPortal')

const listResponse = (concise: string[]) => ({ rows: '/results', concise, detailed: true as const })

const portalFields = ['_id', 'title', 'owner', 'staging', 'ingress', 'updatedAt']
const pageFields = ['_id', 'title', 'type', 'portals', 'requestedPortals', 'owner', 'updatedAt']
const reuseFields = ['_id', 'title', 'slug', 'portals', 'requestedPortals', 'owner', 'updatedAt']

const declaredOperations: Partial<Record<ScopedOperationId | keyof typeof imageOperations, AgentOperation | AgentOperation[]>> = {
  // portals
  listPortals: {
    name: 'list_portals',
    title: { en: 'List portals', fr: 'Lister les portails' },
    description: 'List the portals of the active account, page by page (count is the total). Returns their id, title, owner, staging mode and address (ingress).',
    fixed: { select: portalFields.join(',') },
    response: listResponse(portalFields)
  },
  createPortal: {
    name: 'create_portal',
    title: { en: 'Create a portal', fr: 'Créer un portail' },
    description: 'Create a portal for the active account, with a default configuration and its publication site in data-fair. Give its title, or the id of a portal to duplicate. Then edit its configuration with the portals_portal_config tools and put it live with portals_publish_portal_config.',
    bodyFields: ['config', 'sourcePortalId']
  },
  getPortal: {
    name: 'get_portal',
    title: { en: 'Get a portal', fr: 'Lire un portail' },
    description: 'Read a portal: its title, owner, settings and address (ingress). Read its draft configuration with portals_portal_config_getData.',
    params: idParam('portal'),
    response: { concise: ['_id', 'title', 'owner', 'staging', 'contributorDepartments', 'ingress', 'createdAt', 'updatedAt'], detailed: true }
  },
  updatePortal: {
    name: 'update_portal_settings',
    title: { en: 'Update the settings of a portal', fr: 'Modifier les paramètres d\'un portail' },
    description: 'Change the settings of a portal: its staging mode (contributors publish without asking the administrators), the departments whose administrators may publish on it as if they owned it (only when the portal belongs to the organization root), its owner. Its configuration is edited with the portals_portal_config tools.',
    params: idParam('portal'),
    bodyFields: ['staging', 'contributorDepartments', 'owner'],
    security: agentSecurity('portals', 'admin'),
    labels: portalLabel
  },
  deletePortal: {
    name: 'delete_portal',
    title: { en: 'Delete a portal', fr: 'Supprimer un portail' },
    description: 'Delete a portal, its images and its publication site in data-fair. Its pages stay, detached from it.',
    params: idParam('portal'),
    labels: portalLabel
  },
  publishPortalDraft: {
    name: 'publish_portal_config',
    title: { en: 'Publish the draft configuration of a portal', fr: 'Publier le brouillon de configuration d\'un portail' },
    description: 'Put the draft configuration of a portal live: the portal shows it from now on, and its publication site in data-fair is updated.',
    params: idParam('portal'),
    labels: portalLabel
  },
  cancelPortalDraft: {
    name: 'cancel_portal_config_draft',
    title: { en: 'Discard the draft configuration of a portal', fr: 'Annuler le brouillon de configuration d\'un portail' },
    description: 'Discard the changes of the draft configuration of a portal: the draft becomes the live configuration again.',
    params: idParam('portal'),
    annotations: { destructiveHint: true },
    labels: portalLabel
  },
  putPortalDraftConfig: {
    name: 'portal_config',
    // the approval card shows this title to the person: no tool name, but the draft is still said to be unpublished
    title: { en: 'Portal draft configuration (not live until published)', fr: 'Brouillon de configuration du portail (non visible avant publication)' },
    editor: { schemaOperation: 'getPortalConfigSchema', readOperation: 'getPortalDraftConfig' }
  },
  listFontAssets: {
    name: 'list_font_assets',
    title: { en: 'List the font files', fr: 'Lister les fichiers de police' },
    description: 'List the font files uploaded by the active account. Their family name can be chosen in the theme of a portal configuration.',
    response: listResponse(['_id', 'name', 'subset', 'weightRange', 'style', 'file'])
  },
  createFontAsset: {
    name: 'upload_font_asset',
    title: { en: 'Upload a font file', fr: 'Ajouter un fichier de police' },
    description: 'Upload a font file (WOFF2, OTF or TTF) for the active account. Its family name then appears in the font choices of the portals_portal_config theme.'
  },
  deleteFontAsset: {
    name: 'delete_font_asset',
    title: { en: 'Delete a font file', fr: 'Supprimer un fichier de police' },
    description: 'Delete a font file of the active account.',
    params: idParam('font file')
  },
  createImage: {
    name: 'upload_image',
    title: { en: 'Upload an image', fr: 'Ajouter une image' },
    description: 'Upload an image for a portal, a page or a reuse (body.resource). Returns its _id, name and mimeType: put them in an image field of the configuration (portals_page_config_setFieldValue, portals_portal_config_setFieldValue or portals_update_reuse). A large image also gets a mobile version (mobileAlt).',
    params: {
      width: { description: 'Width to resize the image to, in pixels.' },
      height: { description: 'Height to resize the image to, in pixels.' }
    }
  },

  // pages
  listPages: {
    name: 'list_pages',
    title: { en: 'List pages', fr: 'Lister les pages' },
    description: 'List the pages of the active account, with optional text search and filters, page by page (count is the total). Returns their id, title, type and the portals they are attached to.',
    fixed: { select: pageFields.join(',') },
    params: {
      q: { description: 'Keywords searched in the titles and descriptions.' }
    },
    response: listResponse(pageFields)
  },
  createPage: [{
    name: 'create_page',
    title: { en: 'Create a page', fr: 'Créer une page' },
    description: 'Create a page of the active account, attached to no portal. Give its type and config.title, or the id of a page to duplicate (sourcePageId). Event, news and free (generic) pages get a slug from their title, unique per owner. Then build its content with the portals_page_config tools, publish it with portals_publish_page and attach it to portals with portals_attach_page_to_portals.',
    bodyFields: ['type', 'title', 'config', 'sourcePageId']
  }, {
    name: 'create_page_on_portals',
    title: { en: 'Create a page on portals', fr: 'Créer une page sur des portails' },
    description: 'Create a page of the active account attached to portals at once. Same as portals_create_page otherwise. A standard page (home, contact, legal notice, catalogs...) replaces the page of the same type on these portals.',
    bodyFields: ['type', 'title', 'config', 'sourcePageId', 'portals'],
    bodyRequired: ['portals'],
    security: agentSecurity('pages', 'admin'),
    labels: portalsLabel
  }],
  getPage: {
    name: 'get_page',
    title: { en: 'Get a page', fr: 'Lire une page' },
    description: 'Read a page: its title, type, owner, and the portals it is attached to or requested on. Read its draft content with portals_page_config_getData.',
    params: idParam('page'),
    response: { concise: [...pageFields, 'createdAt', 'configUpdatedAt'], detailed: true }
  },
  updatePage: [{
    name: 'update_page',
    title: { en: 'Rename a page', fr: 'Renommer une page' },
    description: 'Change the title of a page in the back-office lists (an empty title follows the title of its configuration). Its content is edited with the portals_page_config tools.',
    params: idParam('page'),
    bodyFields: ['title']
  }, {
    name: 'attach_page_to_portals',
    title: { en: 'Attach a page to portals', fr: 'Attacher une page à des portails' },
    description: 'Set the portals a page is shown on: the list replaces the current value entirely. A home page cannot be removed from a portal. A standard page (home, contact, legal notice, catalogs...) replaces the page of the same type on the portals it is added to. A portal shows the published configuration of the page (portals_publish_page).',
    params: idParam('page'),
    bodyFields: ['portals'],
    security: agentSecurity('pages', 'admin'),
    labels: { ...pageLabel, ...portalsLabel }
  }, {
    name: 'request_page_publication',
    title: { en: 'Request the publication of a page', fr: 'Demander la publication d\'une page' },
    description: 'Set the portals the publication of a page is requested on, for their administrators to accept: the list replaces the current value entirely.',
    params: idParam('page'),
    bodyFields: ['requestedPortals'],
    security: agentSecurity('pages', 'admin'),
    labels: { ...pageLabel, ...requestedPortalsLabel }
  }, {
    name: 'transfer_page',
    title: { en: 'Transfer a page', fr: 'Transférer une page' },
    description: 'Give a page, with its images, to another owner (an account or a department you administer). Its slug must be unique for the new owner.',
    params: idParam('page'),
    bodyFields: ['owner'],
    security: agentSecurity('pages', 'admin'),
    labels: pageLabel
  }],
  deletePage: {
    name: 'delete_page',
    title: { en: 'Delete a page', fr: 'Supprimer une page' },
    description: 'Delete a page and its images: it disappears from the portals it is attached to.',
    params: idParam('page'),
    labels: pageLabel
  },
  publishPageDraft: {
    name: 'publish_page',
    title: { en: 'Publish the draft of a page', fr: 'Publier le brouillon d\'une page' },
    description: 'Put the draft configuration of a page live: the portals it is attached to show it from now on. Attach it to portals with portals_attach_page_to_portals.',
    params: idParam('page'),
    labels: pageLabel
  },
  cancelPageDraft: {
    name: 'cancel_page_draft',
    title: { en: 'Discard the draft of a page', fr: 'Annuler le brouillon d\'une page' },
    description: 'Discard the changes of the draft configuration of a page: the draft becomes the live configuration again.',
    params: idParam('page'),
    annotations: { destructiveHint: true },
    labels: pageLabel
  },
  previewPage: {
    name: 'preview_portal_page',
    title: { en: 'Preview a portal page', fr: 'Prévisualiser une page de portail' },
    description: 'Render a portal page as a visitor would and return a screenshot, the page\'s accessibility snapshot in Playwright\'s YAML format, and what went wrong (console errors, failed API calls, timeout). Console warnings are only counted and never matter: ignore them. The screenshot is for you: the person does not see it, so say you looked at it, never that you displayed it (« j\'ai affiché » sends them looking for it on screen), describe what it shows and never tell them it is attached; when they ask to see it, say in that reply that the image stays on your side and give them the page\'s screen in the back-office, where « Aperçu (brouillon) » shows the draft. By default it renders the page\'s draft as the page editor previews it: the blocks with the portal\'s theme, without the portal\'s header and footer, and catalogs showing placeholder items. Call it after saving the draft (portals_page_config_saveForm) and before portals_publish_page. With draft=false it renders the published page on the portal. It renders signed in with your session: the portal\'s header shows the account\'s menu where an anonymous visitor sees « Se connecter », and content restricted to the account shows too; say so when the person asks how visitors see the page. Use this tool, not fetch_url, for this platform\'s portal pages: fetch_url runs no JavaScript, has no session, and cannot reach drafts. The render reads the page\'s content (datasets, applications, reuses) with your account\'s permissions, so their content in the result is expected. Do not use this tool to read data your scopes do not otherwise grant, for example by embedding other platform URLs in a page to read them back.',
    annotations: { readOnlyHint: true, openWorldHint: true },
    params: {
      ...idParam('page'),
      portal: { description: 'the portal whose theme the preview uses (draft) or that serves the page (draft=false); default: the page\'s first portal, else its first requested portal' }
    },
    response: { image: '/image', text: '/text' }
  },
  putPageDraftConfig: {
    name: 'page_config',
    // the approval card shows this title to the person: no tool name, but the draft is still said to be unpublished
    title: { en: 'Page draft content (not live until published)', fr: 'Brouillon de page (non visible avant publication)' },
    editor: { schemaOperation: 'getPageConfigSchema', readOperation: 'getPageDraftConfig' }
  },
  listGroups: {
    name: 'list_groups',
    title: { en: 'List page groups', fr: 'Lister les groupes de pages' },
    description: 'List the page groups of the active account. A free (generic) page joins a group in its configuration (genericMetadata.group).',
    response: listResponse(['_id', 'title', 'slug', 'description', 'rootPage'])
  },
  createGroup: {
    name: 'create_group',
    title: { en: 'Create a page group', fr: 'Créer un groupe de pages' },
    description: 'Create a group of free pages for the active account. Its slug comes from its title.'
  },
  getGroup: {
    name: 'get_group',
    title: { en: 'Get a page group', fr: 'Lire un groupe de pages' },
    params: idParam('group')
  },
  updateGroup: {
    name: 'update_group',
    title: { en: 'Update a page group', fr: 'Modifier un groupe de pages' },
    params: idParam('group')
  },
  deleteGroup: {
    name: 'delete_group',
    title: { en: 'Delete a page group', fr: 'Supprimer un groupe de pages' },
    description: 'Delete a page group. Its pages stay.',
    params: idParam('group'),
    labels: groupLabel
  },

  // reuses
  listReuses: {
    name: 'list_reuses',
    title: { en: 'List reuses', fr: 'Lister les réutilisations' },
    description: 'List the reuses of the active account, with optional text search and filters, page by page (count is the total). Returns their id, title and the portals they are attached to.',
    fixed: { select: reuseFields.join(',') },
    params: {
      q: { description: 'Keywords searched in the titles, summaries, descriptions, authors and dataset titles.' }
    },
    response: listResponse(reuseFields)
  },
  createReuse: {
    name: 'create_reuse',
    title: { en: 'Create a reuse', fr: 'Créer une réutilisation' },
    description: 'Create a reuse of the active account (an application, a website or an article using datasets), attached to no portal. Its slug comes from its title, unique per owner. Publish it with portals_publish_reuse and attach it to portals with portals_attach_reuse_to_portals.',
    bodyFields: ['config']
  },
  getReuse: {
    name: 'get_reuse',
    title: { en: 'Get a reuse', fr: 'Lire une réutilisation' },
    params: idParam('reuse'),
    response: { concise: [...reuseFields, 'createdAt', 'submitter', 'draftConfig'], detailed: true }
  },
  updateReuse: [{
    name: 'update_reuse',
    title: { en: 'Edit the draft of a reuse', fr: 'Modifier le brouillon d\'une réutilisation' },
    description: 'Replace the draft configuration of a reuse: draftConfig replaces the current value entirely, read it first with portals_get_reuse. Then portals_publish_reuse puts it live.',
    params: idParam('reuse'),
    bodyFields: ['draftConfig']
  }, {
    name: 'attach_reuse_to_portals',
    title: { en: 'Attach a reuse to portals', fr: 'Attacher une réutilisation à des portails' },
    description: 'Set the portals a reuse is shown on: the list replaces the current value entirely. A portal shows the published configuration of the reuse (portals_publish_reuse).',
    params: idParam('reuse'),
    bodyFields: ['portals'],
    security: agentSecurity('reuses', 'admin'),
    labels: { ...reuseLabel, ...portalsLabel }
  }, {
    name: 'request_reuse_publication',
    title: { en: 'Request the publication of a reuse', fr: 'Demander la publication d\'une réutilisation' },
    description: 'Set the portals the publication of a reuse is requested on, for their administrators to accept: the list replaces the current value entirely.',
    params: idParam('reuse'),
    bodyFields: ['requestedPortals'],
    security: agentSecurity('reuses', 'admin'),
    labels: { ...reuseLabel, ...requestedPortalsLabel }
  }, {
    name: 'transfer_reuse',
    title: { en: 'Transfer a reuse', fr: 'Transférer une réutilisation' },
    description: 'Give a reuse, with its images, to another owner (an account or a department you administer).',
    params: idParam('reuse'),
    bodyFields: ['owner'],
    security: agentSecurity('reuses', 'admin'),
    labels: reuseLabel
  }],
  deleteReuse: {
    name: 'delete_reuse',
    title: { en: 'Delete a reuse', fr: 'Supprimer une réutilisation' },
    description: 'Delete a reuse and its images: it disappears from the portals it is attached to.',
    params: idParam('reuse'),
    labels: reuseLabel
  },
  publishReuseDraft: {
    name: 'publish_reuse',
    title: { en: 'Publish the draft of a reuse', fr: 'Publier le brouillon d\'une réutilisation' },
    description: 'Put the draft configuration of a reuse live: the portals it is attached to show it from now on.',
    params: idParam('reuse'),
    labels: reuseLabel
  },
  cancelReuseDraft: {
    name: 'cancel_reuse_draft',
    title: { en: 'Discard the draft of a reuse', fr: 'Annuler le brouillon d\'une réutilisation' },
    description: 'Discard the changes of the draft configuration of a reuse: the draft becomes the live configuration again.',
    params: idParam('reuse'),
    annotations: { destructiveHint: true },
    labels: reuseLabel
  },
  submitReuse: {
    name: 'submit_reuse',
    title: { en: 'Submit a reuse to a portal', fr: 'Proposer une réutilisation à un portail' },
    description: 'Submit a reuse to a portal that accepts reuses from its users: its draft is published, the reuse is given to the owner of the portal (the submitter is kept) and its publication is requested on the portal.',
    params: idParam('reuse'),
    labels: reuseLabel
  }
}

/**
 * Closed world (MCP `openWorldHint: false`) unless an operation says otherwise: portal configurations, pages,
 * groups, fonts and images are written by the account's members only, so their results are not outside content
 * for the agents service (its tool-output tripwire does not scan them, its approval reviewer does not count them as
 * exposure). Reuses stay open: a portal's users from other accounts submit them, and the submitted reuse is given
 * to the portal's owner. The page preview declares itself open: it renders datasets.
 */
const closedWorld = (operation: AgentOperation): AgentOperation => ({
  ...operation,
  annotations: { openWorldHint: false, ...operation.annotations }
})

export const operations: typeof declaredOperations = Object.fromEntries(Object.entries(declaredOperations).map(([id, operation]) => {
  if ((scopedOperations as Record<string, { family?: string }>)[id]?.family === 'reuses') return [id, operation]
  return [id, Array.isArray(operation) ? operation.map(closedWorld) : closedWorld(operation as AgentOperation)]
}))
