const owner = require('./partial/owner')

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
      title: 'Titre de la réutilisation'
    },
    description: {
      type: 'string',
      'x-display': 'custom-markdown',
      title: 'Description'
    },
    image: {
      type: 'object',
      contentMediaType: 'image/*',
      title: 'Image',
      writeOnly: true
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
