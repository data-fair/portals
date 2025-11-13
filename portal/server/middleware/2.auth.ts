import { session } from '~~/server/plugins/session'

export default defineEventHandler(async (event) => {
  const portal = event.context.portal
  if (!portal) return // portal middleware should run first

  if (portal.config.authentication === 'required' || portal.draft) {
    const cookieHeader = getRequestHeader(event, 'cookie')

    let sessionState
    try {
      sessionState = await session.readStateFromCookie(cookieHeader)
    } catch (err) {
      if (err && typeof err === 'object' && 'status' in err && err.status === 401) {
        sessionState = null
      } else {
        throw err
      }
    }

    if (!sessionState?.user) {
      const requestUrl = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })
      const loginUrl = `/simple-directory/login?redirect=${encodeURIComponent(requestUrl.href)}`
      await sendRedirect(event, loginUrl, 302)
    }
  }
})
