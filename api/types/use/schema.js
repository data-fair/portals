export default {
  $id: 'https://github.com/data-fair/portals/use',
  'x-exports': ['types', 'validate'],
  title: 'Use',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'title', 'slug', 'owner', 'created', 'updated', 'config', 'portals', 'requestedPortals'],
  properties: {
    _id: {
      type: 'string',
      readOnly: true
    },
    title: { type: 'string' }, // synced from config.title
    slug: {
      type: 'string',
      title: 'Slug',
      readOnly: true
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    created: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    updated: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    config: { $ref: 'https://github.com/data-fair/portals/use-config' },
    portals: {
      type: 'array',
      items: { type: 'string' }
    },
    requestedPortals: {
      type: 'array',
      items: { type: 'string' }
    }
  }
}
