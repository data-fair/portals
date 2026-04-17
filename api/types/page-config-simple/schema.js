import pageElementsSchema from '../page-elements/schema.js'
import pageConfigSchema from '../page-config/schema.js'

// Re-use the element definition from page-elements but remove the page-preview-element summary slot
const element = {
  ...pageElementsSchema.$defs.element,
  layout: {
    getDefaultData: pageElementsSchema.$defs.element.layout.getDefaultData
    // no switch with page-preview-element summary slot
  }
}

export default {
  $id: 'https://github.com/data-fair/portals/page-config-simple',
  'x-exports': ['vjsf', 'compiledLayout'],
  'x-jstt': { additionalProperties: false },
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true,
    webmcp: true
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
