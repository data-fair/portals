// The preview of a page for the agents ("vision"): the page is rendered by the capture service, as the
// calling user (a short-lived GET-only session of simple-directory), and the screenshot comes back with
// a text report of the render.
import type { Page } from '#types/page/index.ts'
import type { Portal } from '#types/portal/index.ts'
import type { SessionStateAuthenticated } from '@data-fair/lib-express'
import { httpError } from '@data-fair/lib-express'
import { privateAxiosInstance as axios } from '@data-fair/lib-node/axios.js'
import config from '#config'
import { pagePath } from './operations.ts'

export { pagePath }

// default lifetime of the pseudo session of a caller whose own token carries no expiration (seconds)
const defaultSessionDuration = 120

/**
 * The url to render. The draft is the read-only route of the manager UI that shows the page draft as the
 * page editor previews it, with the theme of the portal; it is on the main site (managerUrl, the public
 * url of the manager seen by the request), so the session cookie applies directly. The published page
 * is on the public host of the portal.
 */
export const previewTarget = (managerUrl: string, portal: Pick<Portal, '_id' | 'ingress'>, page: Page, draft: boolean): string => {
  if (draft) return `${managerUrl.replace(/\/+$/, '')}/pages/${encodeURIComponent(page._id)}/preview?portal=${encodeURIComponent(portal._id)}`
  const base = portal.ingress?.url ?? config.portalUrlPattern.replace('{subdomain}', portal._id)
  return base.replace(/\/+$/, '') + pagePath(page)
}

/**
 * The status the preview answers with when an internal service fails: 504 on a timeout, 503 when the service
 * does not answer at all, else 502. The messages carry the status code only, never what the service
 * answered (it could echo secrets or cookies).
 */
export const upstreamError = (service: string, err: any) => {
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') return httpError(504, `${service} timed out`)
  if (!err.status) return httpError(503, `${service} is unreachable`)
  return httpError(502, `${service} failed (${err.status})`)
}

export const assertPreviewConfigured = () => {
  if (!config.privateCaptureUrl || !config.secretKeys.capture || !config.secretKeys.pseudoSession) {
    throw httpError(501, 'the page preview is not configured on this platform (capture service and pseudo sessions)')
  }
}

/**
 * Asks simple-directory for a short-lived GET-only session of the same user and active account as the
 * caller. Returns the value of a Cookie header: id_token and id_token_sign, plus id_token_org and
 * id_token_dep, which select the active account (without them the session is the personal account).
 */
export const pseudoSessionCookie = async (session: SessionStateAuthenticated): Promise<string> => {
  const exp = (session.user as { exp?: number }).exp ?? Math.floor(Date.now() / 1000) + defaultSessionDuration
  let cookies: string[]
  try {
    const res = await axios.post(`${config.privateDirectoryUrl}/api/auth/pseudo`, {
      type: 'user',
      id: session.user.id,
      organization: session.account.type === 'organization' ? session.account.id : undefined,
      department: session.account.department,
      exp
    }, { headers: { 'x-secret-key': config.secretKeys.pseudoSession } })
    cookies = res.headers['set-cookie'] ?? []
  } catch (err: any) {
    // an identity simple-directory does not know, typically the user of an organization API key
    if (err.status === 404) throw httpError(400, 'previews need a user or agent session')
    // pseudo sessions disabled, wrong secret... a platform problem, not the caller's
    throw upstreamError('the directory service', err)
  }
  const cookie = cookies
    .map(c => c.split(';')[0])
    // the other cookies set by simple-directory are only cleared (empty value)
    .filter(c => /^(id_token|id_token_sign|id_token_org|id_token_dep)=[^=]/.test(c))
  // rendering anonymously would answer with a login page and pass for a success
  if (!cookie.some(c => c.startsWith('id_token='))) throw httpError(502, 'the directory service did not open a session to render the page')
  return cookie.join('; ')
}

export type InspectResult = { image: { data: string, mediaType: string }, text: string, report: Record<string, unknown> }

/** Renders the target as the owner of the cookie, through the internal /inspect route of capture. */
export const inspect = async (target: string, cookie: string, opts: { mobile: boolean, fullPage: boolean }): Promise<InspectResult> => {
  try {
    const res = await axios.get(`${config.privateCaptureUrl}/api/v1/inspect`, {
      params: { target, mobile: String(opts.mobile), fullPage: String(opts.fullPage) },
      headers: { 'x-secret-key': config.secretKeys.capture, Cookie: cookie },
      timeout: 60000
    })
    return res.data
  } catch (err: any) {
    throw upstreamError('the capture service', err)
  }
}

// token bucket per user, in memory like the other limiters of the platform: nb renders per duration
// seconds. A single process serves the previews, a restart gives the budget back.
const buckets = new Map<string, { tokens: number, at: number }>()

/** Takes one render of the budget of a user: 0 when taken, else the seconds to wait. */
export const consumePreview = (userId: string): number => {
  const { duration, nb } = config.defaultLimits.pagePreviews
  const now = Date.now()
  const rate = nb / (duration * 1000)
  const bucket = buckets.get(userId) ?? { tokens: nb, at: now }
  bucket.tokens = Math.min(nb, bucket.tokens + (now - bucket.at) * rate)
  bucket.at = now
  if (buckets.size > 1000) {
    // an idle bucket is full again: forgetting it changes nothing
    for (const [key, other] of buckets) {
      if (now - other.at > duration * 1000) buckets.delete(key)
    }
  }
  buckets.set(userId, bucket)
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    return 0
  }
  return Math.max(1, Math.ceil((1 - bucket.tokens) / rate / 1000))
}

export const clearPreviewLimits = () => buckets.clear()
