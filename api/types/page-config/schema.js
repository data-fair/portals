export default {
  $id: 'https://github.com/data-fair/portals/page-config',
  'x-exports': ['types', 'vjsf'],
  'x-jstt': { additionalProperties: false },
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'Page config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    children: [{
      title: 'Metadata',
      'x-i18n-title': {
        fr: 'Métadonnées'
      },
      children: ['title', 'description', 'eventMetadata', 'newsMetadata', 'genericMetadata']
    }, {
      title: 'Content',
      'x-i18n-title': {
        fr: 'Contenu'
      },
      children: ['elements']
    }]
  },
  required: ['title', 'elements'],
  properties: {
    title: {
      type: 'string',
      title: 'Title',
      'x-i18n-title': {
        fr: 'Titre'
      }
    },
    description: {
      type: 'string',
      title: 'Description',
      'x-i18n-title': {
        fr: 'Description'
      },
      layout: 'textarea'
    },
    eventMetadata: {
      type: 'object',
      required: ['slug', 'startDate'],
      default: {},
      layout: { if: 'context.pageType === "event"' },
      properties: {
        slug: { $ref: '#/$defs/slug' },
        startDate: {
          type: 'string',
          format: 'date-time',
          title: 'Start Date',
          'x-i18n-title': {
            fr: "Date de l'évènement"
          }
        },
        endDate: {
          type: 'string',
          format: 'date-time',
          title: 'End Date',
          'x-i18n-title': {
            fr: 'Date de fin'
          }
        }
      }
    },
    newsMetadata: {
      type: 'object',
      required: ['slug'],
      default: {},
      layout: { if: 'context.pageType === "news"' },
      properties: {
        slug: { $ref: '#/$defs/slug' },
        date: {
          type: 'string',
          format: 'date-time',
          title: 'Date'
        }
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
          title: 'Group',
          'x-i18n-title': {
            fr: 'Groupe'
          },
          required: ['_id', 'title', 'slug'],
          layout: {
            getItems: {
              url: '/portals-manager/api/groups?select=_id,title,slug',
              itemsResults: 'data.results',
              itemTitle: 'item.title',
              itemKey: 'item._id'
            }
          },
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            slug: { type: 'string' }
          }
        }
      }
    },
    elements: {
      type: 'array',
      layout: {
        slots: { component: 'page-elements' }
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
