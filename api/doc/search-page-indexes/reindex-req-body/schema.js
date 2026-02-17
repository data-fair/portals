import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import searchPageRefSchema from '#types/search-page-ref/schema.js'

const schema = jsonSchema(searchPageRefSchema)
  .pickProperties(['portal', 'owner', 'resource', 'path', 'public', 'privateAccess'])
  .removeProperties(['_id', 'indexedAt', 'indexingStatus'])
  .set({ required: ['portal', 'owner', 'resource', 'path'] })
  .schema

export default {
  ...schema,
  $id: 'https://github.com/data-fair/portals/search-page-indexes/reindex-req-body',
  title: 'Reindex request body',
  'x-exports': ['validate', 'types'],
}
