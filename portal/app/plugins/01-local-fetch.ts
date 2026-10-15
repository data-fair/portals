// a custom fetch intended to make api calls to other services (data-fair, etc)
// it accepts url starting with / and it redirects the request toward the local proxy: the site's own
// origin, or the in-cluster L2 nginx when upstreamProxyHost is set. Calls go as the visitor: their
// cookie, their IP and the forwarder secret, so the stack limits them as if they called directly
// (utils/ssr-forward.ts, data-fair docs/architecture/agent-rate-limiting.md)

import { getRequestHeader, getRequestURL, type H3Event } from 'h3'
import type { Dispatcher } from 'undici'

// data-fair is the least stable dependency of a portal, its ssr calls get their own
// dispatcher: a short inactivity timeout (undici defaults to 300s) so a slow or down
// data-fair degrades the blocks that need it instead of blocking the whole page render,
// and a separate connection pool so it cannot starve the calls to our own services
const dataFairTimeout = 5000

export default defineNuxtPlugin(async () => {
  let _ssrDispatcher: Dispatcher
  let _ssrDataFairDispatcher: Dispatcher
  let clientIp: (event: H3Event) => string | undefined = () => undefined
  const config = useRuntimeConfig()
  const upstreamProxyHost = config.upstreamProxyHost || undefined

  if (import.meta.server) {
    const { Agent, interceptors } = await import('undici')
    const dns = await import('node:dns')
    const { reqIp } = await import('@data-fair/lib-express/req-origin.js')
    // the visitor's IP as our reverse proxy forwarded it; none for a render that did not come through it
    clientIp = (event) => reqIp(event.node.req, { optional: true })
    // our load balancers ips should not change; with an upstream proxy, every site host resolves to it
    const dnsOptions: NonNullable<Parameters<typeof interceptors.dns>[0]> = { maxTTL: Infinity }
    if (upstreamProxyHost) {
      const proxy = proxyLookupTarget(upstreamProxyHost)
      dnsOptions.lookup = (_origin, opts, cb) => {
        dns.lookup(proxy.host, { ...opts, all: true }, (err, addresses) => {
          if (err) return cb(err, [])
          const list = Array.isArray(addresses) ? addresses : [addresses]
          cb(null, list.map(a => ({ address: a.address, family: (a.family === 6 ? 6 : 4) as 4 | 6, ttl: Infinity })))
        })
      }
    }
    const createDispatcher = (options?: { headersTimeout: number, bodyTimeout: number }) => new Agent({
      connections: 8,
      // the hop to the proxy is plain http
      allowH2: !upstreamProxyHost,
      ...options
    }).compose(interceptors.dns(dnsOptions))
    _ssrDispatcher = createDispatcher()
    _ssrDataFairDispatcher = createDispatcher({ headersTimeout: dataFairTimeout, bodyTimeout: dataFairTimeout })
  }

  const localFetch = $fetch.create({
    onRequest ({ request, options, error }) {
      if (import.meta.server) {
        const url = typeof request === 'string' ? request : request.url
        if (!url.startsWith('/')) throw new Error('localFetch should be used with path only')
        const event = useRequestEvent()!
        const { origin } = getRequestURL(event)
        const cookies = getRequestHeader(event, 'cookie')
        if (cookies) options.headers.set('cookie', cookies)
        const target = ssrTarget(origin, upstreamProxyHost)
        for (const [name, value] of Object.entries({ ...target.headers, ...ssrForwardHeaders(clientIp(event), config.secretTrustedForwarder || undefined) })) {
          options.headers.set(name, value)
        }
        options.baseURL = target.baseURL
        options.retry = 0
        options.dispatcher = url.startsWith('/data-fair/') ? _ssrDataFairDispatcher : _ssrDispatcher
      }
    }
  })
  return { provide: { localFetch } }
})
