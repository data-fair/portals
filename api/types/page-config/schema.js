export default {
  $id: 'https://github.com/data-fair/portals/page-config',
  'x-exports': ['types', 'vjsf'],
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
  },
  title: 'Page config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: ''
  },
  required: ['title', 'elements'],
  properties: {
    title: {
      type: 'string',
      title: 'Titre'
    },
    description: {
      type: 'string',
      title: 'Description'
    },
    elements: {
      type: 'array',
      layout: {
        slots: {
          component: 'page-elements'
        }
      },
      items: {
        $ref: 'https://github.com/data-fair/portals/page-elements#/$defs/element'
      }
    }
  }
}
