import type { RequestPortal } from '~~/server/middleware/1.get-portal'
import { defineEventHandler, setResponseHeader } from 'h3'

export default defineEventHandler((event) => {
  const portal: RequestPortal = event.context.portal

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')

  if (portal.draft || !portal.config.llmsFullText) {
    setResponseStatus(event, 404)
    return 'Not Found'
  }

  return portal.config.llmsFullText
})
