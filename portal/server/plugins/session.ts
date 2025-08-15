import { SessionHandler } from '@data-fair/lib-node/session.js'

export const session = new SessionHandler()

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  session.initJWKS(config.privateDirectoryUrl)
})
