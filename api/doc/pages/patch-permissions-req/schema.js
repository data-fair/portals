import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import pageSchema from '#types/page/schema.js'

export default {
  ...jsonSchema(pageSchema)
    .pickProperties(['public', 'permissions'])
    .removeRequired()
    .schema,
  $id: 'https://github.com/data-fair/portals/pages/patch-permissions-req',
  title: 'Patch page permissions req body',
  'x-exports': ['validate', 'types', 'vjsf'],
  'x-vjsf': { compName: 'page-permissions' },
  layout: { title: null }
}
