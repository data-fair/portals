const config = require('./config.json')
const owner = require('./partial/owner')
module.exports = {
  type: 'object',
  required: ['_id', 'owner', 'config', 'configDraft'],
  properties: {
    _id: {
      type: 'string'
    },
    host: {
      type: 'string',
      description: 'Le nom de domaine (exemple = test1.koumoul.com)'
    },
    owner,
    config,
    configDraft: config
  }
}
