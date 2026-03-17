export default {
  $id: 'https://github.com/data-fair/portals/search-page',
  'x-exports': ['types', 'validate'],
  title: 'Search page',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'owner', 'resource', 'portal', 'path'],
  properties: {
    _id: {
      type: 'string',
      readOnly: true
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    etag: {
      type: 'string',
      description: 'ETag of the last indexed HTML response'
    },
    indexedAt: {
      type: 'string',
      description: 'Last indexing date of this page',
      format: 'date-time'
    },
    lastUpdate: {
      type: 'string',
      description: 'Last update date of the MongoDB document',
      format: 'date-time'
    },
    portal: {
      type: 'string',
      description: 'Portal ID'
    },
    resource: {
      additionalProperties: false,
      required: ['type', 'id'],
      properties: {
        type: {
          type: 'string',
          enum: ['page', 'reuse', 'dataset', 'application']
        },
        id: {
          type: 'string'
        }
      }
    },
    path: {
      type: 'string',
      description: 'Full path of the resource on the portal'
    },
    public: {
      type: 'boolean'
    },
    privateAccess: {
      type: 'array',
      items: {
        $ref: 'https://github.com/data-fair/lib/access-ref'
      }
    },
    indexingStatus: {
      type: 'string',
      enum: ['ok', 'toIndex', 'toDelete', 'error']
    }
  }
}
