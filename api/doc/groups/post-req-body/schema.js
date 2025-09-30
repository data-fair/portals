import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import groupSchema from '#types/group/schema.js'

export default {
  ...jsonSchema(groupSchema)
    .pickProperties(['title', 'description'])
    .removeFromRequired(['description'])
    .schema,
  $id: 'https://github.com/data-fair/portals/groups/post-req-body',
  title: 'Post group req body',
  'x-exports': ['validate', 'types'],
}
