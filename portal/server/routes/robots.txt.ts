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
    '# JSON APIs and exports of every service on the domain: nothing indexable',
    '# there (each service answers X-Robots-Tag: noindex) and expensive to crawl',
    'Disallow: /*/api/',
    '',
    '# assets needed for rendering (images, fonts)',
    'Allow: /portal/api/images/',
    'Allow: /portal/api/font-assets/',
    'Allow: /portal/api/pages/*/images/',
    '',
    '# dataset API roots crawled before the 2026-05 allow-list are still indexed:',
    '# let Google re-crawl them so it sees the noindex and drops them',
    '# (remove this rule once Search Console no longer lists them)',
    'Allow: /data-fair/api/v1/datasets/*/$',
    '',
    `Sitemap: ${requestURL.origin}/sitemap.xml`
  ].join('\n')
})
