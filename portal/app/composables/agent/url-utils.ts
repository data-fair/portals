// Pure helpers for turning agent-facing links into absolute portal URLs and back
// into router paths. Kept free of Vue/router/window so they can be unit-tested.
//
// Why this exists: the agent chat renders prose in the agents iframe and the iframe
// resolves clicked links against its own URL, so links must be full absolute URLs
// (origin + history base + path) to survive the round-trip to the host portal. The
// host (useAgentChatBase) only does an SPA router.push when a clicked link's pathname
// starts with the router history base — otherwise it full-reloads window.location. The
// agent is therefore handed ready-made absolute URLs (list_pages, get_current_location);
// `navigate` accepts those same absolute URLs (or a bare path) and reduces them back to
// a base-less router path for router.push.

/** Strip a trailing slash from a router history base: '/portal/' -> '/portal', '/' -> ''. */
const normalizeBase = (base: string): string => (base.endsWith('/') ? base.slice(0, -1) : base)

/**
 * Build an absolute portal URL from a router path. The path may be a template still
 * containing placeholders (e.g. `/datasets/{slug}`), so no URL parsing is done here.
 */
export function toAbsoluteUrl (origin: string, base: string, path: string): string {
  return origin + normalizeBase(base) + (path.startsWith('/') ? path : '/' + path)
}

/**
 * Reduce any link the agent produced — a full URL, a base-prefixed path, or a bare
 * router path — to a base-less router path plus any embedded query string. Robust to a
 * wrong/hallucinated origin: only the pathname (and query) of the input is used.
 */
export function toRoutePath (origin: string, base: string, input: string): { path: string, query?: string } {
  const parsed = new URL(input, origin)
  const baseNoTrailing = normalizeBase(base)
  let pathname = parsed.pathname
  if (baseNoTrailing && (pathname === baseNoTrailing || pathname.startsWith(baseNoTrailing + '/'))) {
    pathname = pathname.slice(baseNoTrailing.length) || '/'
  }
  return { path: pathname, query: parsed.search ? parsed.search.slice(1) : undefined }
}
