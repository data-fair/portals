import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { defineEventHandler, setResponseHeader } from 'h3'
import { portalMongo } from '~~/server/plugins/mongo'

const SOURCE_CONTACT = 'https://github.com/data-fair'

export default defineEventHandler(async (event) => {
  const requestURL = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
  const portal: RequestPortal = event.context.portal
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  // Surface the portal's contact page only when it is actually configured —
  // same existence check as the sitemap route.
  const contactPage = await portalMongo.pages.findOne(
    {
      type: 'contact',
      'owner.type': portal.owner.type,
      'owner.id': portal.owner.id,
      [portal.staging ? 'requestedPortals' : 'portals']: portal._id
    },
    { projection: { _id: 1 } }
  )

  const lines = [
    ...(contactPage ? [`Contact: ${requestURL.origin}/contact`] : []),
    `Contact: ${SOURCE_CONTACT}`,
    `Expires: ${expires}`,
    'Preferred-Languages: fr, en',
    `Canonical: ${requestURL.origin}/.well-known/security.txt`
  ]

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return lines.join('\n') + '\n'
})
