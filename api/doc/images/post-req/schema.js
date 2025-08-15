import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import imageSchema from '#types/image/schema.js'

export default {
  type: 'object',
  required: ['body', 'query', 'file'],
  properties: {
    body: jsonSchema(imageSchema)
      .pickProperties(['resource'])
      .removeId()
      .schema,
    query: {
      type: 'object',
      properties: {
        width: {
          type: 'number'
        },
        height: {
          type: 'number'
        }
      }
    },
    file: {
      type: 'object',
      required: ['path'],
      properties: {
        path: {
          type: 'string'
        }
      }
    }
  },

  $id: 'https://github.com/data-fair/portals/images/post-req',
  title: 'Post image req',
  'x-exports': ['validate', 'types'],
}
