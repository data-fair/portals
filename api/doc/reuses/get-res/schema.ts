export default {
  $id: 'https://github.com/data-fair/portals/reuses/get-res',
  'x-exports': ['types'],
  title: 'ReusesGetRes',
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
      items: { $ref: 'https://github.com/data-fair/portals/reuse' }
    }
  },
  $defs: {
    facets: {
      title: 'ReusesFacets',
      type: 'object',
      additionalProperties: false,
      required: ['portals', 'requestedPortals'],
      properties: {
        portals: {
          type: 'object',
          additionalProperties: {
            type: 'number'
          }
        },
        requestedPortals: {
          type: 'object',
          additionalProperties: {
            type: 'number'
          }
        }
      }
    }
  }
}
