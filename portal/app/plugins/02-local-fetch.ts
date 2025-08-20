// a custom fetch intended to make api calls to other services (data-fair, etc)
// it accepts url starting with / and it redirects the request toward the local proxy

import { getRequestHeader, getRequestURL } from 'h3'
import type { Dispatcher } from 'undici'

export default defineNuxtPlugin(async (nuxtApp) => {
  let _ssrDispatcher: Dispatcher

  if (import.meta.server) {
    const { Agent, interceptors } = await import('undici')
    _ssrDispatcher = new Agent({
      connections: 8,
      allowH2: true
    }).compose(interceptors.dns({
      // our load balancers ips should not change
      maxTTL: Infinity
    }))
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
        options.baseURL = origin
        options.retry = 0
        options.dispatcher = _ssrDispatcher
      }
    }
  })
  return {
    provide: {
      localFetch,
    },
  }
})
