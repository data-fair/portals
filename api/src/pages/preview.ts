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

const baseUrl = (portal: Pick<Portal, '_id' | 'ingress'>, draft: boolean) => {
  if (draft) return config.portalUrlPattern.replace('{subdomain}', `${portal._id}.draft`)
  return portal.ingress?.url ?? config.portalUrlPattern.replace('{subdomain}', portal._id)
}

/** The url to render: the draft host of the portal (draftConfig, requested pages) or its public host */
export const previewTarget = (portal: Pick<Portal, '_id' | 'ingress'>, page: Page, draft: boolean): string => {
  const path = pagePath(page, draft)
  return baseUrl(portal, draft).replace(/\/+$/, '') + path
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
    // an identity simple-directory does not know (an API key user), an expired token...
    if (err.status >= 400 && err.status < 500) throw httpError(err.status, `a session to render the page cannot be opened for this identity: ${typeof err.data === 'string' ? err.data : err.message}`)
    throw err
  }
  const cookie = cookies
    .map(c => c.split(';')[0])
    // the other cookies set by simple-directory are only cleared (empty value)
    .filter(c => /^(id_token|id_token_sign|id_token_org|id_token_dep)=[^=]/.test(c))
  // rendering anonymously would answer with a login page and pass for a success
  if (!cookie.some(c => c.startsWith('id_token='))) throw httpError(502, 'simple-directory did not open a session to render the page')
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
    if (err.status) throw httpError(502, `the capture service failed to render the page (${err.status}): ${typeof err.data === 'string' ? err.data : err.message}`)
    throw httpError(503, `the capture service is unreachable: ${err.message}`)
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
