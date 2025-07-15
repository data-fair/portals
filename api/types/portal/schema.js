export default {
  $id: 'https://github.com/data-fair/portals/portal',
  'x-exports': ['types', 'validate'],
  title: 'Portal',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'owner', 'created', 'updated', 'config', 'draftConfig'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    created: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    updated: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    config: { $ref: '#/$defs/config' },
    draftConfig: { $ref: '#/$defs/config' },
  },
  $defs: {
    config: {
      type: 'object',
      title: 'Portal config',
      allOf: [{
        title: 'Métadonnées',
        required: ['title'],
        properties: {
          title: {
            type: 'string'
          },
          description: {
            type: 'string'
          }
        }
      }]
    }
  }
}
