import type { RequestPortal } from '~~/server/middleware/get-portal'
import { defineEventHandler, setResponseHeader } from 'h3'

export default defineEventHandler((event) => {
  const requestURL = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
  const portal: RequestPortal = event.context.portal

  setResponseHeader(event, 'content-type', 'text/plain')

  if (portal.draft || !portal.config.allowRobots) {
    return [
      'User-agent: *',
      'Disallow: /'
    ].join('\n')
  }
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${requestURL.origin}/sitemap.xml`
  ].join('\n')
})
