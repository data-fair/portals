import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import portalSchema from '#types/portal/schema.js'

const configSchema = {
  type: 'object',
  required: ['title'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string'
    }
  }
}

const schema = jsonSchema(portalSchema)
  .pickProperties(['staging', 'config'])
  .schema

schema.properties.config = configSchema

export default {
  ...schema,
  $id: 'https://github.com/data-fair/portals/portals/post-req-body',
  title: 'Post portal req body',
  'x-exports': ['validate', 'types'],
}
