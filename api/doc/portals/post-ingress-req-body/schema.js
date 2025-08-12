import portalSchema from '#types/portal/schema.js'

export default {
  ...portalSchema.$defs.ingress,
  $id: 'https://github.com/data-fair/portals/portals/post-ingress-req-body',
  title: 'Post portal ingress req body',
  'x-exports': ['validate', 'types'],
}
