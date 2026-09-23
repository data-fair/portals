import type { RequestPortal } from '~~/server/middleware/1.get-portal'
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
  // robots.txt only controls the crawl: what gets indexed is decided by each
  // service on the domain through X-Robots-Tag / meta noindex, and a noindex is
  // only seen on pages that crawlers are allowed to fetch
  return [
    'User-agent: *',
    'Content-Signal: search=yes, ai-train=no, ai-input=yes',
    '',
    'Allow: /',
    '',
    `Sitemap: ${requestURL.origin}/sitemap.xml`
  ].join('\n')
})
