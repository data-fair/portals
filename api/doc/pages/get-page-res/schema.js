export default {
  $id: 'https://github.com/data-fair/portals/pages/get-page-res',
  'x-exports': ['types'],
  title: 'PageEnriched',
  type: 'object',
  allOf: [{ $ref: 'https://github.com/data-fair/portals/page' }],
  properties: {
    userPermissions: {
      type: 'array',
      items: { type: 'string', enum: ['read', 'write'] }
    }
  }
}
