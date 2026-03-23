export default {
  $id: 'https://github.com/data-fair/portals/search-engine-result',
  'x-exports': ['types'],
  title: 'Search engine result',
  type: 'object',
  additionalProperties: false,
  properties: {
    path: {
      type: 'string',
      description: 'Full path of the resource on the portal'
    },
    title: {
      type: 'string',
      description: 'Title of the search result'
    },
    description: {
      type: 'string',
      description: 'Description/summary of the search result'
    },
    resourceType: {
      type: 'string',
      enum: ['page', 'reuse', 'dataset', 'application'],
      description: 'Type of the resource'
    }
  }
}
