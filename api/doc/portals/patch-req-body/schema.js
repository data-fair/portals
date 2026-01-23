import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import portalSchema from '#types/portal/schema.js'

export default {
  ...jsonSchema(portalSchema)
    .pickProperties(['draftConfig', 'owner', 'whiteLabel'])
    .removeRequired()
    .schema,
  $id: 'https://github.com/data-fair/portals/portals/patch-req-body',
  title: 'Patch portal req body',
  'x-exports': ['validate', 'types'],
}
