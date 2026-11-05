import type { RequestPortal } from '~~/server/middleware/1.get-portal'

export default defineEventHandler(async (event) => {
  const portal: RequestPortal = event.context.portal
  const page = await findPortalPage(portal, getRouterParam(event, 'type') as string, getRouterParam(event, 'slug') as string)
  if (!page) throw createError({ status: 404, message: 'Page not found' })
  return { _id: page._id, ...page.config }
})
