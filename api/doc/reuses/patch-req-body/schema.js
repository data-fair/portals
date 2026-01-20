import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import reuseSchema from '#types/reuse/schema.js'

export default {
  ...jsonSchema(reuseSchema)
    .pickProperties(['config', 'draftConfig', 'portals', 'requestedPortals', 'owner'])
    .removeRequired()
    .schema,
  $id: 'https://github.com/data-fair/reuses/reuses/patch-req-body',
  title: 'Patch reuse req body',
  'x-exports': ['validate', 'types'],
}
