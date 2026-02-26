import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import fontAssetSchema from '#types/font-asset/schema.js'

export default {
  ...jsonSchema(fontAssetSchema)
    .removeProperties(['_id', 'owner', 'createdAt', 'data'])
    .schema,
  $id: 'https://github.com/data-fair/portals/font-assets/post-req-body',
  title: 'Post font asset req body',
  'x-exports': ['validate', 'types', 'vjsf'],
  'x-vjsf': { compName: 'font-asset' },
  layout: { title: null }

}
