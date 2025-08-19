import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import portalSchema from '#types/portal/schema.js'

export default {
  ...jsonSchema(portalSchema)
    .pickProperties(['staging', 'config'])
    .schema,
  $id: 'https://github.com/data-fair/portals/portals/post-req-body',
  title: 'Post portal req body',
  'x-exports': ['validate', 'types'],
}
