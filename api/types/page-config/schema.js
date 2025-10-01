export default {
  $id: 'https://github.com/data-fair/portals/page-config',
  'x-exports': ['types', 'vjsf'],
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'Page config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: '',
    children: [{
      title: 'Métadonnées',
      children: ['title', 'description', 'group']
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
    // TODO: Group is required when page.type is 'generic'.
    group: {
      type: 'object',
      title: 'Groupe',
      required: ['_id', 'title', 'slug'],
      properties: {
        _id: { type: 'string' },
        title: { type: 'string' },
        slug: { type: 'string' }
      },
      layout: {
        getItems: {
          url: '/portals-manager/api/groups?select=_id,title,slug',
          itemsResults: 'data.results',
          itemTitle: 'item.title',
          itemKey: 'item._id'
        }
      }
    },
    // TODO: add events and news metadata
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
