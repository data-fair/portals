export default {
  $id: 'https://github.com/data-fair/portals/reuse-config',
  'x-exports': ['types', 'vjsf'],
  'x-jstt': { additionalProperties: false },
  'x-vjsf': {
    pluginsImports: ['@koumoul/vjsf-markdown'],
    xI18n: true
  },
  'x-vjsf-locales': ['en', 'fr'],
  title: 'Reuse config',
  type: 'object',
  unevaluatedProperties: false,
  layout: {
    title: null,
    children: [{
      title: 'Metadata',
      'x-i18n-title': {
        fr: 'Métadonnées'
      },
      children: ['title', 'author', 'link', 'image', 'summary']
    }, {
      title: 'Description',
      'x-i18n-title': {
        fr: 'Description'
      },
      children: ['description']
    }, {
      title: 'Datasets',
      'x-i18n-title': {
        fr: 'Jeux de données'
      },
      children: ['datasets']
    }]
  },
  required: ['title'],
  properties: {
    title: {
      type: 'string',
      title: 'Title',
      'x-i18n-title': {
        fr: 'Titre'
      }
    },
    author: {
      type: 'string',
      title: 'Author',
      'x-i18n-title': {
        fr: 'Auteur'
      }
    },
    link: {
      type: 'string',
      title: 'Link',
      'x-i18n-title': {
        fr: 'Lien'
      },
      format: 'uri'
    },
    image: {
      type: 'object',
      title: 'Image',
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Image' }
          }
        },
        cols: { md: 6 }
      },
      properties: {
        _id: {
          type: 'string'
        },
        name: {
          type: 'string'
        },
        mimeType: {
          type: 'string'
        },
        mobileAlt: {
          type: 'boolean'
        }
      }
    },
    summary: {
      type: 'string',
      title: 'Summary',
      'x-i18n-title': {
        fr: 'Résumé'
      },
      layout: 'textarea',
      maxLength: 500
    },
    description: {
      type: 'string',
      title: 'Description (Markdown)',
      'x-i18n-title': {
        fr: 'Description (Markdown)'
      },
      layout: 'markdown'
    },
    _descriptionHtml: {
      type: 'string',
      readOnly: true,
      layout: 'none'
    },
    datasets: {
      type: 'array',
      title: 'Datasets',
      'x-i18n-title': {
        fr: 'Jeux de données'
      },
      items: {
        type: 'object',
        required: ['id', 'title'],
        layout: {
          getItems: {
            url: '/data-fair/api/v1/datasets?select=id,title,slug&owner={context.owner.type}:{context.owner.id}',
            itemKey: 'item.id',
            itemTitle: 'item.title',
            itemsResults: 'data.results'
          }
        },
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' }
        }
      }
    }
  }
}
