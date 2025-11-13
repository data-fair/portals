import { escapeRegExp } from '@data-fair/lib-utils/micro-template.js'
import { portalMongo } from '~~/server/plugins/mongo'
import type { Portal } from '~~/../api/types/portal'

const config = useRuntimeConfig()

const draftUrlRegexp = new RegExp('^' + escapeRegExp(config.portalUrlPattern).replace('\\{subdomain\\}', '(.*)') + '$')

export type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner' | 'staging'> & { draft: boolean }

export default defineEventHandler(async (event) => {
  if (!config.portalUrlPattern) throw new Error('config.portalUrlPattern is required')
  const mongo = portalMongo
  const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin

  // TODO: small memory cache based on origin ?
  const portalMatch = origin.match(draftUrlRegexp)
  const draft = portalMatch && portalMatch[1].endsWith('.draft')
  const portal = await mongo.portals.findOne(
    portalMatch ? { _id: draft ? portalMatch[1].slice(0, -6) : portalMatch[1] } : { 'ingress.url': origin },
    { projection: { _id: 1, owner: 1, staging: 1, config: draft ? undefined : 1, draftConfig: draft ? 1 : undefined } }
  )
  if (!portal) throw createError({ status: 404, message: 'portal not found' })
  const requestPortal: RequestPortal = { _id: portal._id, owner: portal.owner, staging: portal.staging, config: draft ? portal.draftConfig : portal.config, draft: !!draft }
  event.context.portal = requestPortal
})
