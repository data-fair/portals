const owner = require('./partial/owner')

const urlPattern = '^(|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]+\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s]{2,})$'

module.exports = {
  type: 'object',
  required: ['_id', 'title'],
  additionalProperties: false,
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    owner,
    slug: {
      type: 'string',
      title: "Identifiant lisible pour l'URL",
      readOnly: true
    },
    portal: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      readOnly: true
    },
    published: {
      type: 'boolean',
      title: 'Publiée',
      default: false
    },
    publishedAt: {
      type: 'string',
      description: 'Date de publication',
      format: 'date-time',
      readOnly: true
    },
    title: {
      type: 'string',
      title: 'Titre de la réutilisation',
      'x-props': { autofocus: true }
    },
    author: {
      type: 'string',
      title: 'Auteur'
    },
    datasets: {
      type: 'array',
      title: 'Jeux de données',
      'x-fromUrl': '{context.dataFairUrl}/api/v1/datasets?q={q}&publicationSites={context.publicationSite}&visibility=public&select=id,title',
      'x-itemsProp': 'results',
      'x-itemTitle': 'title',
      'x-itemKey': 'href',
      items: {
        type: 'object',
        title: 'Jeu de données',
        additionalProperties: false,
        required: ['id'],
        properties: {
          href: { type: 'string' },
          title: { type: 'string' },
          id: { type: 'string' }
        }
      }
    },
    image: {
      type: 'object',
      contentMediaType: 'image/*',
      title: 'Image',
      writeOnly: true,
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        size: { type: 'number' }
      }
    },
    description: {
      type: 'string',
      'x-display': 'custom-markdown',
      title: 'Description',
      minLength: 20
    },
    links: {
      type: 'object',
      title: 'Liens',
      properties: {
        web: {
          type: 'string',
          // cf https://stackoverflow.com/a/17773849/10132434
          pattern: urlPattern,
          title: 'Web',
          description: 'Ajoutez un lien vers une page Web.',
          'x-props': { hideDetails: 'auto' }
        },
        iframe: {
          type: 'string',
          // cf https://stackoverflow.com/a/17773849/10132434
          pattern: urlPattern,
          title: 'Intégration dans un cadre',
          description: 'Ajoutez une adresse de page Web à afficher directement dans un cadre à côté de la description de cette réutilisation.',
          'x-props': { hideDetails: 'auto' }
        },
        android: {
          type: 'string',
          // cf https://stackoverflow.com/a/17773849/10132434
          pattern: urlPattern,
          title: 'Android',
          description: 'Ajoutez un lien vers une application Android dans un store.',
          'x-props': { hideDetails: 'auto' }
        },
        ios: {
          type: 'string',
          // cf https://stackoverflow.com/a/17773849/10132434
          pattern: urlPattern,
          title: 'IOS',
          description: 'Ajoutez un lien vers une application IOS dans un store.',
          'x-props': { hideDetails: 'auto' }
        }
      }
    },
    created: {
      type: 'object',
      additionalProperties: false,
      readOnly: true,
      properties: {
        id: {
          type: 'string',
          description: 'Id of the user that created this page'
        },
        name: {
          type: 'string',
          description: 'Name of the user that created this page'
        },
        date: {
          type: 'string',
          description: 'Creation date of this page',
          format: 'date-time'
        }
      }
    },
    updated: {
      type: 'object',
      additionalProperties: false,
      readOnly: true,
      properties: {
        id: {
          type: 'string',
          description: 'Id of the user that created this page'
        },
        name: {
          type: 'string',
          description: 'Name of the user that created this page'
        },
        date: {
          type: 'string',
          description: 'Creation date of this page',
          format: 'date-time'
        }
      }
    }
  }
}
