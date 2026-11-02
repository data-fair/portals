export default {
  $id: 'https://github.com/data-fair/portals/font-asset',
  'x-exports': ['types'],
  title: 'Font asset',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'name', 'owner', 'createdAt', 'subset', 'weightRange', 'style', 'file', 'data'],
  properties: {
    _id: {
      type: 'string'
    },
    owner: { $ref: 'https://github.com/data-fair/lib/account' },
    createdAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/createdAt' },
    name: {
      type: 'string',
      title: 'Font family name',
      'x-i18n-title': { fr: 'Nom de la famille de police' }
    },
    subset: {
      title: 'Character set',
      'x-i18n-title': { fr: 'Ensemble de caractères' },
      default: 'latin',
      oneOf: [
        { const: 'latin', title: 'Latin' },
        { const: 'latin-ext', title: 'Extended Latin', 'x-i18n-title': { fr: 'Latin étendu' } }
      ]
    },
    weightRange: {
      type: 'string',
      title: 'Weight',
      'x-i18n-title': { fr: 'Poids' },
      description: 'Variable WOFF2: range, e.g. "300 700". Static OTF/TTF: single value, e.g. "400".',
      'x-i18n-description': { fr: 'WOFF2 variable : plage ex. "300 700". OTF/TTF statique : valeur unique ex. "400".' },
      default: '400 700'
    },
    style: {
      type: 'string',
      title: 'Style',
      default: 'normal',
      examples: ['normal', 'italic']
    },
    file: {
      type: 'object',
      title: 'Font file',
      'x-i18n-title': { fr: 'Fichier de police' },
      required: ['name', 'size'],
      layout: { comp: 'file-input', accept: '.woff2,.otf,.ttf' },
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
      description: 'A nodejs buffer containing the actual font file.'
    },
  }
}
