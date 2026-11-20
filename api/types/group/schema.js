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
      title: 'Identifier',
      readOnly: true
    },
    slug: {
      type: 'string',
      title: 'Slug'
    },
    title: {
      type: 'string',
      title: 'Title'
    },
    description: {
      type: 'string',
      title: 'Description',
      description: 'A free text describing the group. It is shown on the group card.'
    },
    rootPage: {
      type: 'string',
      title: 'Root page',
      description: 'Slug of a page used as the root of the group in the breadcrumbs of its pages.'
    },
    owner: { $ref: 'https://github.com/data-fair/lib/account' },
    createdAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/createdAt' },
    updatedAt: { $ref: 'https://github.com/data-fair/portals/partial#/$defs/updatedAt' }
  }
}
