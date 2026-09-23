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
    '# dataset downloads and exports: expensive to crawl and of no use as a search result.',
    '# The other APIs stay open: crawlers call them to render pages and embedded applications.',
    'Disallow: /*/api/v1/datasets/*/full',
    'Disallow: /*/api/v1/datasets/*/raw',
    'Disallow: /*/api/v1/datasets/*/convert',
    'Disallow: /*/api/v1/datasets/*/data-files/',
    'Disallow: /*/api/v1/datasets/*/lines?*format=',
    '',
    `Sitemap: ${requestURL.origin}/sitemap.xml`
  ].join('\n')
})
