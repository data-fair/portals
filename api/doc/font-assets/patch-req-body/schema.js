import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import fontAssetSchema from '#types/font-asset/schema.js'

export default {
  ...jsonSchema(fontAssetSchema)
    .pickProperties(['name', 'subset', 'weightRange', 'style'])
    .removeRequired()
    .schema,
  $id: 'https://github.com/data-fair/portals/font-assets/patch-req-body',
  title: 'Patch font asset req body',
  'x-exports': ['validate', 'types', 'vjsf'],
  'x-vjsf': { compName: 'font-asset-patch' },
  layout: { title: null }
}
