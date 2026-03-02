export default {
  $id: 'https://github.com/data-fair/portals/search-page/post-search-page',
  'x-exports': ['types', 'validate'],
  title: 'Post search page',
  type: 'object',
  additionalProperties: false,
  required: ['portal', 'owner', 'resource'],
  properties: {
    portal: {
      type: 'string',
      description: 'Portal ID'
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    resource: {
      additionalProperties: false,
      required: ['type', 'id'],
      properties: {
        type: {
          type: 'string',
          enum: ['dataset', 'application']
        },
        id: {
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
    indexingStatus: {
      type: 'string',
      enum: ['toIndex', 'toDelete'],
      description: 'Status of the search page indexing. Use toIndex to index or reindex, toDelete to remove from the index.'
    }
  }
}
