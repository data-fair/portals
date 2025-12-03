export default {
  $id: 'https://github.com/data-fair/portals/image',
  'x-exports': ['types'],
  title: 'Image',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'owner', 'resource', 'created', 'name', 'width', 'height', 'mimeType'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    resource: {
      type: 'object',
      additionalProperties: false,
      required: ['type', '_id'],
      properties: {
        type: {
          type: 'string',
          enum: ['page', 'portal', 'reuse']
        },
        _id: {
          type: 'string'
        }
      }
    },
    created: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    name: {
      type: 'string'
    },
    width: {
      type: 'number'
    },
    height: {
      type: 'number'
    },
    mimeType: {
      type: 'string'
    },
    data: {
      type: 'object',
      tsType: 'any',
      description: 'A nodejs buffer containing the actual image file.'
    },
    mobileAlt: {
      type: 'boolean',
      description: 'If true there is an alternative image version of this image for mobile (max width 1280px)'
    }
  }
}
