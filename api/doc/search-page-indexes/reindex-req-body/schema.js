import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import searchPageRefSchema from '#types/search-page-ref/schema.js'

const resourceSchema = jsonSchema(searchPageRefSchema.properties.resource)
  .set({
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['dataset', 'application'] },
      id: { type: 'string' }
    },
    required: ['type', 'id']
  })
  .schema

const schema = jsonSchema(searchPageRefSchema)
  .pickProperties(['portal', 'owner', 'resource', 'public', 'privateAccess'])
  .removeProperties(['_id', 'indexedAt', 'indexingStatus', 'path'])
  .addProperty('resource', resourceSchema)
  .set({ required: ['portal', 'owner', 'resource'] })
  .schema

export default {
  ...schema,
  $id: 'https://github.com/data-fair/portals/search-page-indexes/reindex-req-body',
  title: 'Reindex request body',
  'x-exports': ['validate', 'types'],
}
