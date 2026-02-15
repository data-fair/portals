export default {
  $id: 'https://github.com/data-fair/portals/search-page',
  'x-exports': ['types', 'validate'],
  title: 'Search page',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'owner', 'resource'],
  properties: {
    _id: {
      type: 'string',
      readOnly: true
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    resource: {
      additionalProperties: false,
      required: ['type', 'id', 'slug'],
      properties: {
        type: {
          type: 'string',
          enum: ['page', 'reuse', 'dataset', 'application']
        },
        id: {
          type: 'string'
        },
        slug: {
          type: 'string'
        }
      }
    },
    public: {
      type: 'boolean'
    },
    privateAccess: {
      type: 'array',
      items: {
        $ref: 'https://github.com/data-fair/portals/access-account-ref'
      }
    },
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    text: {
      type: 'string'
    }
  }
}
