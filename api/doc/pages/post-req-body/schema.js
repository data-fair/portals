import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import pageSchema from '#types/page/schema.js'

export default {
  ...jsonSchema(pageSchema)
    .pickProperties(['type', 'config', 'owner', 'portals'])
    .removeFromRequired(['owner', 'portals'])
    .schema,
  $id: 'https://github.com/data-fair/portals/pages/post-req-body',
  title: 'Post page req body',
  'x-exports': ['validate', 'types'],
}
