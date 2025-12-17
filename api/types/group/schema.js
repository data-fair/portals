export default {
  $id: 'https://github.com/data-fair/portals/group',
  'x-exports': ['types', 'validate'],
  title: 'Group',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'slug', 'title', 'description', 'owner', 'createdAt', 'updatedAt'],
  properties: {
    _id: {
      type: 'string',
      title: 'Identifiant',
      readOnly: true
    },
    slug: {
      type: 'string',
      title: 'Slug'
    },
    title: {
      type: 'string',
      title: 'Titre'
    },
    description: {
      type: 'string',
      title: 'Description',
      description: 'Une zone de texte libre pour décrire le groupe. Elle sera affichée sur la vignette du groupe.'
    },
    owner: { $ref: 'https://github.com/data-fair/lib/session-state#/$defs/account' },
    createdAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/createdAt' },
    updatedAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/updatedAt' }
  }
}
