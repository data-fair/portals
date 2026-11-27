import type { UpgradeScript } from '@data-fair/lib-node/upgrade-scripts.js'

type Obj = Record<string, any>

// missing: the value that rendered while the key was missing (or a function of the original object);
// create: also create the absent parents, where an absent parent rendered as that value (siblings of a
// created parent need it too, or a second run would add them)
type Rule = { path: string, missing: unknown, create?: boolean } | { fix: (obj: Obj) => boolean }

const isObj = (value: unknown): value is Obj => !!value && typeof value === 'object' && !Array.isArray(value)

const getPath = (obj: Obj, path: string[]) => {
  let current: unknown = obj
  for (const key of path) {
    if (!isObj(current)) return undefined
    current = current[key]
  }
  return current
}

export const applyRules = (obj: Obj, rules: Rule[]): boolean => {
  const original = structuredClone(obj)
  let changed = false
  for (const rule of rules) {
    if ('fix' in rule) {
      if (rule.fix(obj)) changed = true
      continue
    }
    const path = rule.path.split('.')
    const key = path.pop() as string
    if (!rule.create && !isObj(getPath(original, path))) continue
    if (getPath(original, [...path, key]) !== undefined) continue
    const value = typeof rule.missing === 'function' ? rule.missing(original) : rule.missing
    if (value === undefined) continue
    let parent = obj
    for (const k of path) {
      if (!isObj(parent[k])) parent[k] = {}
      parent = parent[k]
    }
    if (parent[key] !== undefined) continue
    parent[key] = value
    changed = true
  }
  return changed
}

// a thumbnail without location was never displayed
const hideThumbnailWithoutLocation: Rule = {
  fix: (card) => {
    if (!card.thumbnail?.show || card.thumbnail.location !== undefined) return false
    card.thumbnail.show = false
    return true
  }
}

const thumbnailRules: Rule[] = [
  hideThumbnailWithoutLocation,
  { path: 'thumbnail.show', missing: false, create: true },
  { path: 'thumbnail.crop', missing: false, create: true }
]

const datasetCardRules: Rule[] = [
  { path: 'actionsLocation', missing: 'none' },
  { path: 'actionsStyle', missing: 'text' },
  { path: 'titleLinesCount', missing: 1 },
  { path: 'showSummary', missing: false },
  { path: 'ownerDisplay', missing: 'none' },
  { path: 'topics.showIcon', missing: false },
  ...thumbnailRules
]

const reuseCardRules: Rule[] = [
  { path: 'titleLinesCount', missing: 1 },
  { path: 'showSummary', missing: false },
  { path: 'showAuthor', missing: false },
  ...thumbnailRules
]

const eventCardRules: Rule[] = [
  { path: 'titleLinesCount', missing: 1 },
  { path: 'showDescription', missing: false },
  ...thumbnailRules
]

// a missing logo type showed only the mobile logo, as the local type does without a main logo
const logoTypeOf = (mobileLogo: unknown, logo: unknown) => mobileLogo && !logo ? 'local' : 'hidden'

export const portalRules: Rule[] = [
  { path: 'header.show', missing: false },
  { path: 'header.showTitle', missing: false },
  { path: 'header.logoPrimaryType', missing: (c: Obj) => logoTypeOf(c.header?.logoPrimaryMobile, c.header?.logoPrimary) },
  {
    path: 'headerHome.logoPrimaryType',
    missing: (c: Obj) => c.header?.logoPrimaryType === undefined
      ? logoTypeOf(c.headerHome?.logoPrimaryMobile ?? c.header?.logoPrimaryMobile, c.headerHome?.logoPrimary ?? c.header?.logoPrimary)
      : undefined
  },
  { path: 'navBar.logoType', missing: (c: Obj) => c.navBar?.logoMobile && !c.navBar.logo ? 'local' : undefined },
  {
    path: 'navBarHome.logoType',
    missing: (c: Obj) => c.navBar?.logoType === undefined
      ? logoTypeOf(c.navBarHome?.logoMobile ?? c.navBar?.logoMobile, c.navBarHome?.logo ?? c.navBar?.logo)
      : undefined
  },
  { path: 'breadcrumb.showHome', missing: false },
  { path: 'breadcrumb.fluid', missing: false },
  { path: 'breadcrumb.compact', missing: false },
  { path: 'navLinksConfig.showIcon', missing: false, create: true },
  { path: 'navLinksConfig.uppercase', missing: false, create: true },
  // an absent density rendered the Vuetify default, the "default" (spacious) density
  { path: 'defaults.density', missing: 'default', create: true },
  { path: 'datasets.page.metadata.location', missing: 'bottom', create: true },
  { path: 'datasets.page.metadata.actionsStyle', missing: 'text', create: true },
  { path: 'datasets.page.metadata.showDepartment', missing: false, create: true },
  { path: 'datasets.page.topics.show', missing: false, create: true },
  { path: 'datasets.page.topics.showIcon', missing: false, create: true },
  { path: 'datasets.page.keywords.show', missing: false, create: true },
  { path: 'datasets.page.applications.display', missing: 'none', create: true },
  { path: 'datasets.page.relatedDatasets.display', missing: 'none', create: true },
  { path: 'datasets.page.relatedDatasets.columns', missing: 3, create: true },
  { path: 'applications.page.metadata.location', missing: 'bottom', create: true },
  { path: 'applications.page.metadata.actionsStyle', missing: 'text', create: true },
  { path: 'applications.page.metadata.showDepartment', missing: false, create: true },
  { path: 'applications.page.topics.show', missing: false, create: true },
  { path: 'applications.page.topics.showIcon', missing: false, create: true },
  { path: 'applications.page.datasets.display', missing: 'none', create: true },
  { path: 'applications.page.datasets.columns', missing: 3, create: true },
  { path: 'reuses.page.showImage', missing: false },
  { path: 'reuses.page.datasets.display', missing: 'none', create: true }
]

// the cards of the page sections (datasets.page.*.card) are merged over these and left out
const portalCards: [string, Rule[]][] = [
  ['datasets.card', datasetCardRules],
  ['applications.card', datasetCardRules],
  ['reuses.card', reuseCardRules],
  ['events.card', eventCardRules],
  ['news.card', eventCardRules]
]

// an own config was used whenever it existed and usePortalConfig was not true
const ownConfigFlag = (configKey: string): Rule => ({ path: 'usePortalConfig', missing: (e: Obj) => e[configKey] ? false : undefined })

export const elementRules: Record<string, Rule[]> = {
  title: [
    { path: 'anchor.inToc', missing: false },
    {
      // the line growing on hover was only drawn with an explicit "none" position
      fix: (e) => {
        if (e.line?.growOnHover !== true || e.line.position !== undefined) return false
        e.line.growOnHover = false
        return true
      }
    }
  ],
  // an icon without size had the Vuetify default size (24px)
  icon: [{ path: 'size', missing: 24 }],
  button: [{ path: 'centered', missing: false }, ownConfigFlag('config')],
  menu: [{ path: 'centered', missing: false }, ownConfigFlag('config')],
  divider: [{ path: 'rounded', missing: false }],
  banner: [{ path: 'background.tintStrength', missing: 0 }],
  card: [
    { path: 'border', missing: false },
    { path: 'thumbnail.crop', missing: false },
    { path: 'background.tintStrength', missing: 0 },
    { path: 'actionStyle.usePortalConfig', missing: (e: Obj) => e.actionStyle?.config ? false : undefined }
  ],
  tabs: [{ path: 'border', missing: false }],
  metrics: [{ path: 'border', missing: false }],
  topics: [{ path: 'showIcon', missing: false }],
  contact: [
    { path: 'defaultFields.messageMaxLength', missing: 3000, create: true },
    { path: 'sendButton.usePortalConfig', missing: (e: Obj) => e.sendButton?.config ? false : undefined }
  ],
  // a search block without density had the Vuetify default density, it now inherits the portal one
  search: [{ path: 'density', missing: 'default' }],
  'datasets-catalog': [{ path: 'showApiButton', missing: false }],
  'event-catalog': [{ path: 'defaultSort', missing: 'startDate:-1' }],
  // the portals API sorts by creation date when no sort is given
  'reuses-list': [{ path: 'mode', missing: 'lastCreated' }, ownConfigFlag('cardConfig')],
  'news-list': [ownConfigFlag('cardConfig')],
  'event-list': [ownConfigFlag('cardConfig')],
  'applications-list': [ownConfigFlag('cardConfig')],
  application: [{ path: 'actionButtons.style', missing: 'text' }]
}

// the own card of a block (applications-list merges its card over the portal card and is left out)
const elementCardRules: Record<string, Rule[]> = {
  'datasets-list': datasetCardRules,
  'dataset-card': datasetCardRules,
  'reuses-list': reuseCardRules,
  'reuse-card': reuseCardRules,
  'event-list': eventCardRules,
  'event-card': eventCardRules,
  'news-list': eventCardRules,
  'news-card': eventCardRules
}

const walkElements = (elements: unknown, callback: (element: Obj) => void) => {
  if (!Array.isArray(elements)) return
  for (const element of elements) {
    if (!isObj(element)) continue
    callback(element)
    walkElements(element.children, callback)
    walkElements(element.children2, callback)
    walkElements(element.advancedFilters, callback)
    for (const tab of Array.isArray(element.tabs) ? element.tabs : []) walkElements(tab?.children, callback)
    for (const panel of Array.isArray(element.panels) ? element.panels : []) walkElements(panel?.children, callback)
  }
}

// an external link without target opened in the same window
export const freezeLinksTarget = (value: unknown): boolean => {
  let changed = false
  if (Array.isArray(value)) {
    for (const item of value) if (freezeLinksTarget(item)) changed = true
  } else if (isObj(value)) {
    if (value.type === 'external' && typeof value.href === 'string' && value.target === undefined) {
      value.target = false
      changed = true
    }
    for (const child of Object.values(value)) if (freezeLinksTarget(child)) changed = true
  }
  return changed
}

export const freezePortalConfig = (config: unknown): boolean => {
  if (!isObj(config)) return false
  let changed = applyRules(config, portalRules)
  for (const [path, rules] of portalCards) {
    const card = getPath(config, path.split('.'))
    if (isObj(card) && applyRules(card, rules)) changed = true
  }
  if (freezeLinksTarget(config)) changed = true
  return changed
}

export const freezePageConfig = (config: unknown): boolean => {
  if (!isObj(config)) return false
  let changed = false
  walkElements(config.elements, (element) => {
    const rules = elementRules[element.type]
    if (rules && applyRules(element, rules)) changed = true
    const cardRules = elementCardRules[element.type]
    if (cardRules && isObj(element.cardConfig) && applyRules(element.cardConfig, cardRules)) changed = true
  })
  if (freezeLinksTarget(config)) changed = true
  return changed
}

export default {
  description: 'Write the values that rendered for the config keys missing in portals and pages, now rendered as their schema default',
  async exec (db, debug) {
    for (const [collection, freeze] of [['portals', freezePortalConfig], ['pages', freezePageConfig]] as const) {
      let count = 0
      for await (const doc of db.collection(collection).find({}, { projection: { config: 1, draftConfig: 1 } })) {
        const $set: Record<string, unknown> = {}
        if (freeze(doc.config)) $set.config = doc.config
        if (freeze(doc.draftConfig)) $set.draftConfig = doc.draftConfig
        if (!Object.keys($set).length) continue
        await db.collection(collection).updateOne({ _id: doc._id }, { $set })
        count++
      }
      debug(`froze missing config keys in ${count} ${collection}`)
    }
  }
} as UpgradeScript
