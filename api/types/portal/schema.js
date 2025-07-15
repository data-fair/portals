export default {
  $id: 'https://github.com/data-fair/portals/portal',
  'x-exports': ['types', 'validate'],
  title: 'Portal',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'owner', 'title'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    created: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    updated: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    title: {
      type: 'string'
    }
  }
}
