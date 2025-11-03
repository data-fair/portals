export default {
  $id: 'https://github.com/data-fair/portals/font-asset',
  'x-exports': ['types'],
  title: 'Font asset',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'name', 'owner', 'created', 'subset', 'weightRange', 'style', 'file', 'data'],
  properties: {
    _id: {
      type: 'string'
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    created: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/modifier' },
    name: {
      type: 'string',
      title: 'Nom de la famille de police'
    },
    subset: {
      type: 'string',
      title: 'Ensemble de caractères',
      default: 'latin',
      enum: ['latin', 'latin-ext']
    },
    weightRange: {
      type: 'string',
      title: 'Interval de poids',
      default: '300 700'
    },
    style: {
      type: 'string',
      title: 'Style',
      default: 'normal',
      examples: ['normal', 'italic']
    },
    file: {
      type: 'object',
      title: 'Fichier',
      required: ['name', 'size'],
      layout: { comp: 'file-input', accept: '.woff2' },
      properties: {
        name: {
          type: 'string'
        },
        size: {
          type: 'number'
        },
        type: {
          type: 'string'
        }
      }
    },
    data: {
      type: 'object',
      tsType: 'any',
      description: 'A nodejs buffer containing the actual image file.'
    },
  }
}
