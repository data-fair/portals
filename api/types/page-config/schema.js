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
      children: ['title', 'description', 'eventMetadata', 'newsMetadata', 'genericMetadata']
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
    eventMetadata: {
      type: 'object',
      required: ['slug'],
      default: {},
      layout: { if: 'context.pageType === "event"' },
      properties: {
        slug: { $ref: '#/$defs/slug' }
        // TODO: add a start and end date
      }
    },
    newsMetadata: {
      type: 'object',
      required: ['slug'],
      default: {},
      layout: { if: 'context.pageType === "news"' },
      properties: {
        slug: { $ref: '#/$defs/slug' }
        // TODO: add a date
      }
    },
    genericMetadata: {
      type: 'object',
      required: ['slug'],
      default: {},
      layout: { if: 'context.pageType === "generic"' },
      properties: {
        slug: { $ref: '#/$defs/slug' },
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
        }
      }
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
  },
  $defs: {
    slug: {
      type: 'string',
      title: 'Slug',
      // This pattern is only a client-side validation.
      // The actual check is done on the API, which compares the input
      // with the result of slugify and returns an error if they differ.
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    }
  }
}
