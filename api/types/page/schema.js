export default {
  $id: 'https://github.com/data-fair/portals/page',
  'x-exports': ['types', 'validate'],
  title: 'Page',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'title', 'slug', 'owner', 'created', 'updated', 'config', 'draftConfig', 'portals', 'requestedPortals'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    title: {
      type: 'string',
      title: 'Titre',
      readOnly: true
    },
    slug: {
      type: 'string',
      title: 'Slug'
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    created: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    updated: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    config: { $ref: 'https://github.com/data-fair/portals/page-config' },
    draftConfig: { $ref: 'https://github.com/data-fair/portals/page-config' },
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
