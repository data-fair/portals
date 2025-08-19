import { escapeRegExp } from '@data-fair/lib-utils/micro-template.js'
import { portalMongo } from '~~/server/plugins/mongo'
import type { Portal } from '~~/../api/types/portal'

const config = useRuntimeConfig()

const draftUrlRegexp = new RegExp('^' + escapeRegExp(config.draftUrlPattern).replace('\\{id\\}', '(.*)') + '$')

export type RequestPortal = Pick<Portal, '_id' | 'config' | 'owner'> & { draft: boolean }

export default defineEventHandler(async (event) => {
  if (!config.draftUrlPattern) throw new Error('config.draftUrlPattern is required')
  const mongo = portalMongo
  const origin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin

  // TODO: small memory cache based on origin ?
  const draftMatch = origin.match(draftUrlRegexp)
  const portal = await mongo.portals.findOne(
    draftMatch ? { _id: draftMatch[1] } : { 'ingress.url': origin },
    { projection: { _id: 1, owner: 1, config: draftMatch ? undefined : 1, draftConfig: draftMatch ? 1 : undefined } }
  )
  if (!portal) throw createError({ status: 404, message: 'portal not found' })
  const requestPortal: RequestPortal = { _id: portal._id, owner: portal.owner, config: draftMatch ? portal.draftConfig : portal.config, draft: !!draftMatch }
  event.context.portal = requestPortal
})
