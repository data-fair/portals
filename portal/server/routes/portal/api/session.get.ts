import { session } from '~~/server/plugins/session'

export default defineEventHandler(async (event) =>
  await session.readStateFromCookie(getRequestHeader(event, 'cookie')))
