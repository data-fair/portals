export default {
  $id: 'https://github.com/data-fair/portals/image-ref',
  'x-exports': ['types'],
  'x-vjsf-locales': ['en', 'fr'],
  'x-jstt': { additionalProperties: false },
  type: 'object',
  title: 'ImageRef',
  unevaluatedProperties: false,
  required: ['_id', 'name', 'mimeType'],
  properties: {
    _id: {
      type: 'string'
    },
    name: {
      type: 'string'
    },
    mimeType: {
      type: 'string'
    },
    mobileAlt: {
      type: 'boolean'
    }
  }
}
