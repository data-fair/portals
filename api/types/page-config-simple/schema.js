import pageElementsSchema from '../page-elements/schema.ts'
import pageConfigSchema from '../page-config/schema.js'

const ELEMENT_REF = 'https://github.com/data-fair/portals/page-elements#/$defs/element'

// Nested element arrays are indistinguishable in the schema (same type, same layout:
// 'none', same items ref), so they are told apart by their key. advancedFilters is the
// odd one out: it is not content but a strip of filter blocks, hence its own title.
const nestedArrayTitles = {
  children: { title: 'Content', fr: 'Contenu' },
  children2: { title: 'Second content', fr: 'Deuxième contenu' },
  advancedFilters: { title: 'Advanced filters', fr: 'Filtres avancés' }
}

/**
 * Layout elements (banner, card, two columns, tabs...) nest other elements through
 * arrays that the page editor hides with layout: 'none', because it manipulates them on
 * its canvas instead. This context is the one that drives the WebMCP tools and the
 * form-based simple editor, where nesting has to be reachable through the form itself.
 * @param {string} key
 */
const navigableChildrenLayout = (key) => {
  const titles = nestedArrayTitles[/** @type {keyof typeof nestedArrayTitles} */ (key)] ?? nestedArrayTitles.children
  return {
    title: titles.title,
    'x-i18n-title': { fr: titles.fr },
    // catalog-layout only renders the advanced filters when the sibling switch is on;
    // without mirroring that condition the form lets an agent fill an array that is
    // never drawn, a silent no-op
    ...(key === 'advancedFilters' ? { if: 'parent.data?.showAdvancedFilters' } : {}),
    clipboardKey: 'elements',
    listEditMode: 'dialog',
    itemCopy: "{...item, uuid: crypto.randomUUID().split('-')[0]}"
  }
}

/**
 * Unhide the nested element arrays, and re-point their items at the local element:
 * left on the absolute page-elements ref they would resolve back to the canvas
 * definition one level down, reinstating the summary slot and hiding the grandchildren,
 * so nesting would only ever work at depth 1.
 * @param {any} node
 */
const makeRecursionNavigable = (node) => {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    for (const item of node) makeRecursionNavigable(item)
    return
  }
  for (const [key, prop] of Object.entries(node.properties ?? {})) {
    const array = /** @type {any} */ (prop)
    if (array?.type === 'array' && array.items?.$ref === ELEMENT_REF) {
      array.items = { $ref: '#/$defs/element' }
      array.layout = navigableChildrenLayout(key)
    }
  }
  for (const value of Object.values(node)) makeRecursionNavigable(value)
}

// Re-use the element definition from page-elements but remove the page-preview-element
// summary slot. Deep cloned: the definition is shared with the canvas editor's context,
// which must keep its arrays hidden.
const element = {
  ...structuredClone(pageElementsSchema.$defs.element),
  layout: {
    getDefaultData: pageElementsSchema.$defs.element.layout.getDefaultData
    // no switch with page-preview-element summary slot
  }
}
makeRecursionNavigable(element)

export default {
  $id: 'https://github.com/data-fair/portals/page-config-simple',
  'x-exports': ['vjsf', 'compiledLayout'],
  'x-jstt': { additionalProperties: false },
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true,
    webmcp: true,
    ajvOptions: { discriminator: true }
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'PageConfigSimple',
  type: 'object',
  unevaluatedProperties: false,
  layout: pageConfigSchema.layout,
  required: pageConfigSchema.required,
  properties: {
    ...pageConfigSchema.properties,
    elements: {
      type: 'array',
      layout: {
        title: '',
        clipboardKey: 'elements',
        listEditMode: 'dialog',
        itemCopy: "{...item, uuid: crypto.randomUUID().split('-')[0]}"
      },
      items: {
        $ref: '#/$defs/element'
      }
    }
  },
  $defs: {
    ...pageConfigSchema.$defs,
    element
  }
}
