// a custom fetch intended to make api calls to other services (data-fair, etc)
// it accepts url starting with / and it redirects the request toward the local proxy

import { getRequestHeader, getRequestURL } from 'h3'
import type { Dispatcher } from 'undici'

// data-fair is the least stable dependency of a portal, its ssr calls get their own
// dispatcher: a short inactivity timeout (undici defaults to 300s) so a slow or down
// data-fair degrades the blocks that need it instead of blocking the whole page render,
// and a separate connection pool so it cannot starve the calls to our own services
const dataFairTimeout = 5000

export default defineNuxtPlugin(async () => {
  let _ssrDispatcher: Dispatcher
  let _ssrDataFairDispatcher: Dispatcher

  if (import.meta.server) {
    const { Agent, interceptors } = await import('undici')
    const createDispatcher = (options?: { headersTimeout: number, bodyTimeout: number }) => new Agent({
      connections: 8,
      allowH2: true,
      ...options
    }).compose(interceptors.dns({
      // our load balancers ips should not change
      maxTTL: Infinity
    }))
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
        const secretIgnoreRateLimiting = useNuxtApp().$config.secretIgnoreRateLimiting
        if (secretIgnoreRateLimiting) options.headers.set('x-ignore-rate-limiting', secretIgnoreRateLimiting)
        options.baseURL = origin
        options.retry = 0
        options.dispatcher = url.startsWith('/data-fair/') ? _ssrDataFairDispatcher : _ssrDispatcher
      }
    }
  })
  return { provide: { localFetch } }
})
