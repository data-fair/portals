export default {
  $id: 'https://github.com/data-fair/portals/reuse',
  'x-exports': ['types', 'validate'],
  title: 'Reuse',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'title', 'slug', 'owner', 'createdAt', 'updatedAt', 'config', 'portals', 'requestedPortals'],
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
    createdAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/createdAt' },
    updatedAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/updatedAt' },
    config: { $ref: 'https://github.com/data-fair/portals/reuse-config' },
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
