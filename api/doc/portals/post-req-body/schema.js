import jsonSchema from '@data-fair/lib-utils/json-schema.js'
import portalSchema from '#types/portal/schema.js'
import portalConfigSchema from '#types/portal-config/schema.js'

const configSchema = jsonSchema(portalConfigSchema)
  .pickProperties(['title', 'menu'])
  .removeFromRequired(['menu'])
  .schema

const schema = jsonSchema(portalSchema)
  .pickProperties(['staging', 'owner', 'config'])
  .removeFromRequired(['owner'])
  .addProperty('config', configSchema)
  .addProperty('sourcePortalId', { type: 'string', description: 'ID of the portal to duplicate' })
  .schema

export default {
  ...schema,
  $id: 'https://github.com/data-fair/portals/portals/post-req-body',
  title: 'Post portal req body',
  'x-exports': ['validate', 'types'],
}
