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
    title: '',
    children: [{
      title: 'Métadonnées',
      children: ['title', 'description']
    }, {
      title: 'Contenu',
      children: ['elements']
    }]
  },
  required: ['title', 'elements'],
  properties: {
    title: {
      type: 'string',
      title: 'Titre'
    },
    description: {
      type: 'string',
      title: 'Description',
      layout: 'textarea'
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
