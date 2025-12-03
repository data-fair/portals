import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import reuseSchema from '#types/reuse/schema.js'

export default {
  ...jsonSchema(reuseSchema)
    .pickProperties(['config', 'owner', 'portals'])
    .removeFromRequired(['owner', 'portals'])
    .schema,
  $id: 'https://github.com/data-fair/reuses/reuses/post-req-body',
  title: 'Post reuse req body',
  'x-exports': ['validate', 'types'],
}
