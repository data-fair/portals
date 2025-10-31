import { defineEventHandler, setResponseHeader } from 'h3'

export default defineEventHandler((event) => {
  const requestURL = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })

  setResponseHeader(event, 'content-type', 'text/plain')

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${requestURL.origin}/sitemap.xml`
  ].join('\n')
})
