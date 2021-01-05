const config = require('./config.json')

module.exports = {
  type: 'object',
  required: ['_id', 'owner'],
  properties: {
    _id: {
      type: 'string',
    },
    host: {
      type: 'string',
      description: 'Le nom de domaine (exemple = test1.koumoul.com)',
    },
    owner: {
      type: 'object',
      additionalProperties: false,
      required: ['type', 'id'],
      properties: {
        type: {
          type: 'string',
          enum: ['user', 'organization'],
          description: 'If the owner is a user or an organization',
        },
        id: {
          type: 'string',
          description: 'The unique id of the user or organization',
        },
        name: {
          type: 'string',
          description: 'The display name of the user or organization',
        },
      },
    },
    config,
    configDraft: config,
  },
}
