/**
 * How a page render calls our own services (data-fair, the portals API…): as the visitor — their
 * cookie (01-local-fetch.ts), their IP and the forwarder secret, so the stack limits them as if they
 * called directly — and, with an upstream proxy, through the in-cluster L2 nginx rather than back
 * through the public load balancer, whose edge would overwrite the forwarded IP with the pod's
 * (data-fair docs/architecture/agent-rate-limiting.md). Pure: the plugin supplies the request's values.
 *
 * fetch drops an explicit Host header, so the proxy hop keeps the site's host name in the URL, on the
 * proxy's port in plain http, and the dispatcher resolves every host name to the proxy
 * (proxyLookupTarget): the same technique as the mcp server's site-fetch.
 */

/** `host` or `host:port` of the upstream proxy; port 80 when absent. */
export const proxyLookupTarget = (upstreamProxyHost: string): { host: string, port: number } => {
  const i = upstreamProxyHost.lastIndexOf(':')
  if (i === -1) return { host: upstreamProxyHost, port: 80 }
  return { host: upstreamProxyHost.slice(0, i), port: Number(upstreamProxyHost.slice(i + 1)) }
}

export const ssrTarget = (origin: string, upstreamProxyHost?: string): { baseURL: string, headers: Record<string, string> } => {
  if (!upstreamProxyHost) return { baseURL: origin, headers: {} }
  const site = new URL(origin)
  const target = new URL(origin)
  target.protocol = 'http:'
  target.port = String(proxyLookupTarget(upstreamProxyHost).port)
  return {
    baseURL: target.origin,
    headers: { 'x-forwarded-host': site.host, 'x-forwarded-proto': site.protocol.replace(':', '') }
  }
}

export const ssrForwardHeaders = (clientIp: string | undefined, trustedForwarder: string | undefined): Record<string, string> => ({
  ...(clientIp ? { 'x-forwarded-for': clientIp } : {}),
  ...(trustedForwarder ? { 'x-trusted-forwarder': trustedForwarder } : {})
})
