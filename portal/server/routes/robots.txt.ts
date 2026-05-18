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
  return [
    'User-agent: *',
    'Content-Signal: search=yes, ai-train=no, ai-input=yes',
    '',
    '# public portal pages',
    'Allow: /$',
    'Allow: /datasets',
    'Allow: /applications',
    'Allow: /reuses',
    'Allow: /news',
    'Allow: /event',
    'Allow: /pages/',
    'Allow: /pages-',
    'Allow: /catalog-api-doc',
    'Allow: /sitemap',
    'Allow: /contact',
    'Allow: /legal-notice',
    'Allow: /privacy-policy',
    'Allow: /terms-of-service',
    'Allow: /accessibility',
    'Allow: /cookie-policy',
    '',
    '# legacy redirects (let Google crawl them to discover the 302 and update its index)',
    'Allow: /explore',
    '',
    '# assets needed for rendering (CSS/JS bundles, images, fonts)',
    'Allow: /_nuxt/',
    'Allow: /portal/api/images/',
    'Allow: /portal/api/font-assets/',
    'Allow: /portal/api/pages/*/images/',
    '',
    '# block everything else (user pages, JSON APIs, other services on the same domain)',
    'Disallow: /',
    '',
    `Sitemap: ${requestURL.origin}/sitemap.xml`
  ].join('\n')
})
