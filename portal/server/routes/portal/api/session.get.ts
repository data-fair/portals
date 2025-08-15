import { session } from '~~/server/plugins/session'

export default defineEventHandler(async (event) => {
  const sessionState = await session.readStateFromCookie(getRequestHeader(event, 'cookie'))
  return sessionState
})
