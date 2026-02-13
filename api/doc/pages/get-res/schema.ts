export default {
  $id: 'https://github.com/data-fair/portals/pages/get-res',
  'x-exports': ['types'],
  title: 'PagesGetRes',
  type: 'object',
  additionalProperties: false,
  required: [
    'count',
    'facets',
    'results'
  ],
  properties: {
    count: {
      type: 'integer',
      minimum: 0
    },
    facets: {
      $ref: '#/$defs/facets'
    },
    results: {
      type: 'array',
      items: { $ref: 'https://github.com/data-fair/portals/page' }
    }
  },
  $defs: {
    facets: {
      title: 'PagesFacets',
      type: 'object',
      additionalProperties: false,
      required: ['types'],
      properties: {
        types: {
          type: 'object',
          additionalProperties: {
            type: 'number'
          }
        },
        portals: {
          type: 'object',
          additionalProperties: {
            type: 'number'
          }
        },
        owners: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: [
              'id',
              'name',
              'type',
              'count'
            ],
            properties: {
              id: {
                type: 'string'
              },
              name: {
                type: 'string'
              },
              type: {
                type: 'string'
              },
              count: {
                type: 'integer',
                minimum: 0
              },
              departments: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: [
                    'department',
                    'departmentName',
                    'count'
                  ],
                  properties: {
                    department: {
                      type: 'string'
                    },
                    departmentName: {
                      type: 'string'
                    },
                    count: {
                      type: 'integer',
                      minimum: 0
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
