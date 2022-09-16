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
      title: "Identifiant lisible pour l'URL"
    },
    portal: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      readOnly: true
    },
    status: {
      type: 'string',
      enum: ['draft', 'waitingForValidation', 'published']
    },
    title: {
      type: 'string',
      title: 'Titre de la réutilisation'
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
