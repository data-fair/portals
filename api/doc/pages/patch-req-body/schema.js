import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import pageSchema from '#types/page/schema.js'

export default {
  ...jsonSchema(pageSchema)
    .pickProperties(['draftConfig'])
    .schema,
  $id: 'https://github.com/data-fair/portals/pages/patch-req-body',
  title: 'Patch page req body',
  'x-exports': ['validate', 'types'],
}
