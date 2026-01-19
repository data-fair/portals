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
  layout: { title: null },
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
      },
      layout: { cols: { md: 4 } }
    },
    link: {
      type: 'string',
      title: 'Link',
      'x-i18n-title': {
        fr: 'Lien'
      },
      description: 'Link to your reuse: mobile app, website, ...',
      'x-i18n-description': {
        fr: 'Lien vers votre réutilisation : application mobile, site web,...'
      },
      layout: { cols: { md: 4 } }
    },
    image: {
      type: 'object',
      title: 'Image',
      description: 'Images may be disabled by the portal administrator. You can still upload an image, but it may not be displayed.',
      'x-i18n-description': {
        fr: 'Les images peuvent être désactivées par l\'administrateur du portail. Vous pouvez toujours ajouter une image, mais elle pourrait ne pas être affichée.'
      },
      required: ['_id', 'name', 'mimeType'],
      layout: {
        slots: {
          component: {
            name: 'image-upload',
            props: { width: 1280, label: 'Image' }
          }
        },
        cols: { md: 4 }
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
      layout: {
        comp: 'textarea',
        cols: { md: 8 },
        props: {
          autoGrow: true,
          counter: true,
          rows: 3
        }
      }
    },
    datasets: {
      type: 'array',
      title: 'Datasets',
      'x-i18n-title': {
        fr: 'Jeux de données'
      },
      layout: {
        listEditMode: 'inline',
        options: { confirmDeleteItem: false },
        messages: {
          addItem: 'Add a dataset',
          'x-i18n-addItem': {
            fr: 'Ajouter un jeu de données'
          }
        },
        cols: { md: 4 }
      },
      items: {
        type: 'object',
        required: ['id'],
        layout: {
          getItems: {
            // eslint-disable-next-line no-template-curly-in-string
            url: "/data-fair/api/v1/${context.isEmbed ? '/catalog/datasets?' : '/datasets?mine=true&'}raw=true&select=id,title&size=20",
            qSearchParam: 'q',
            itemsResults: 'data.results',
            // eslint-disable-next-line no-template-curly-in-string
            itemTitle: '`${item.title} (${item.id})`',
            itemKey: 'item.id'
          }
        },
        properties: {
          id: { type: 'string' },
          title: { type: 'string' }
        }
      }
    },
    description: {
      type: 'string',
      title: 'Description',
      'x-i18n-title': {
        fr: 'Description'
      },
      layout: 'markdown'
    },
    _descriptionHtml: {
      type: 'string',
      readOnly: true,
      layout: 'none'
    }
  }
}
