import pageElementsSchema from '../page-elements/schema.js'

// Single-element form used inline next to each preview widget in the markup
// editor. Reuses the shared $defs.element definition but drops the
// `page-preview-element` summary slot (we want the full form, not the preview
// again). The discriminator one-of-select stays as-is here and is hidden via
// scoped CSS in markup-element-form-widget.vue — the markup tag is the source
// of truth for element type.
const element = pageElementsSchema.$defs.element

export default {
  $id: 'https://github.com/data-fair/portals/page-element',
  'x-exports': ['vjsf'],
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'PageElement',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    getDefaultData: element.layout.getDefaultData
  },
  oneOfLayout: element.oneOfLayout,
  discriminator: element.discriminator,
  oneOf: element.oneOf
}
