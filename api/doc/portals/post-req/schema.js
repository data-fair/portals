import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import portalSchema from '#types/portal/schema.js'

export const postKeys = ['title']

const body = jsonSchema(portalSchema)
  .pickProperties(postKeys)
  .appendTitle(' post body')
  .removeId()
  .schema

export default {
  $id: 'https://github.com/data-fair/portals/portals/post-req',
  title: 'Post portal req',
  'x-exports': ['validate', 'types'],
  type: 'object',
  required: ['body'],
  properties: {
    body
  }
}
