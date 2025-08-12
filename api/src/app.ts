import { resolve } from 'node:path'
import { session, errorHandler, createSiteMiddleware, createSpaMiddleware } from '@data-fair/lib-express/index.js'
import express from 'express'
import helmet from 'helmet'
import identitiesRouter from './identities/router.ts'
import portalsRouter from './portals/router.ts'
import pagesRouter from './pages/router.ts'
import adminRouter from './admin/router.ts'
import { uiConfig } from './ui-config.ts'

const app = express()
export default app

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
app.use(express.json())

app.use(createSiteMiddleware('portals-manager'))
app.use(session.middleware())

app.use('/assets', express.static('api/assets'))
app.use('/api/portals', portalsRouter)
app.use('/api/pages', pagesRouter)
app.use('/api/identities', identitiesRouter)
app.use('/api/admin', adminRouter)
app.use('/api', (req, res) => res.status(404).send('unknown api endpoint'))

app.use(await createSpaMiddleware(resolve(import.meta.dirname, '../../ui/dist'), uiConfig, {
  csp: { nonce: true, header: true }
}))

app.use(errorHandler)
