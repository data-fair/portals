import { defineEventHandler, setResponseHeader } from 'h3'

export default defineEventHandler((event) => {
  const requestURL = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'Contact: mailto:contact@koumoul.com',
    `Expires: ${expires}`,
    'Preferred-Languages: fr, en',
    `Canonical: ${requestURL.origin}/.well-known/security.txt`
  ].join('\n') + '\n'
})
