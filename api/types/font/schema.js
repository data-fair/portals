export default {
  $id: 'https://github.com/data-fair/portals/font',
  'x-exports': ['types'],
  title: 'Font',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'key', 'variants'],
  properties: {
    name: {
      type: 'string',
      title: 'Nom de la famille de police'
    },
    variants: {
      type: 'array',
      items: {
        type: 'object',
        title: 'Font variant',
        additionalProperties: false,
        required: ['subset', 'weightRange', 'style', 'woff2Url'],
        properties: {
          subset: {
            type: 'string',
            default: 'latin',
            enum: ['latin', 'latin-ext']
          },
          weightRange: {
            type: 'string',
            default: '300 700'
          },
          style: {
            type: 'string',
            default: 'normal',
            examples: ['normal', 'italic']
          },
          woff2Url: {
            type: 'string'
          }
        }
      }
    }
  }
}
