import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { createError, defineEventHandler, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const portal: RequestPortal = event.context.portal

  if (portal.draft || portal.config.authentication === 'none') {
    throw createError({ status: 404 })
  }

  return sendRedirect(event, '/simple-directory/login?action=changePassword', 302)
})
