import { resolve } from 'node:path'
import { session, errorHandler, createSiteMiddleware, createSpaMiddleware, defaultNonceCSPDirectives, allowAnyScope } from '@data-fair/lib-express/index.js'
import express from 'express'
import helmet from 'helmet'
import { uiConfig } from './ui-config.ts'
import config from '#config'
import { getStatus } from './admin/status.ts'
import { scopeDescriptions } from './scopes.ts'
import { apiRouters } from './routers.ts'

export const app = express()

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      // very restrictive by default, index.html of the UI will have custom rules defined in createSpaMiddleware
      // https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#security-headers
      'frame-ancestors': ["'none'"],
      'default-src': ["'none'"]
    }
  }
}))

// no fancy embedded arrays, just string and arrays of strings in req.query
app.set('query parser', 'simple')
app.use(createSiteMiddleware('portals-manager'))
// calls carrying an access token are answered from any origin (it answers their preflights)
app.use(session.bearerCors())
app.use(session.middleware())

app.use(express.json())

// TODO: tune cache headers, fonts files are public and immutable
app.use('/api/assets', express.static(resolve(import.meta.dirname, '../assets')))
for (const [path, router] of Object.entries(apiRouters)) app.use('/api' + path, router)

// unauthenticated and destructive: only in the dev environment, which is also the test environment
if (process.env.NODE_ENV === 'development') {
  const testEnvRouter = (await import('./test-env.ts')).default
  app.use('/api/test-env', testEnvRouter)
}

// the scopes of the service, read by simple-directory (PLATFORM_SCOPES_URL) and data-fair
app.get('/api/scopes.json', allowAnyScope, (req, res) => {
  res.json(scopeDescriptions((req.acceptsLanguages('fr', 'en') || 'fr') as 'fr' | 'en'))
})

app.get('/api/ping', allowAnyScope, async (req, res) => {
  const status = await getStatus(req)
  if (status.status === 'error') res.status(500)
  res.send(status.status)
})

app.use('/api', (req, res) => res.status(404).send('unknown api endpoint'))

app.use(await createSpaMiddleware(resolve(import.meta.dirname, '../../ui/dist'), uiConfig, {
  csp: {
    nonce: true,
    // nonces only work on <style> tags, not on element style attributes, and the svg
    // produced by mermaid carries both
    header: { ...defaultNonceCSPDirectives, 'style-src': "'self' 'unsafe-inline'" }
  },
  privateDirectoryUrl: config.privateDirectoryUrl
}))

app.use(errorHandler)
