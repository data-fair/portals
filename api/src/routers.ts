// the api routers and their mount paths (relative to /api), also walked by the scopes coverage test
import groupRouter from './groups/router.ts'
import portalsRouter from './portals/router.ts'
import pagesRouter from './pages/router.ts'
import reusesRouter from './reuses/router.ts'
import imagesRouter from './images/router.ts'
import identitiesRouter from './identities/router.ts'
import adminRouter from './admin/router.ts'
import fontsRouter from './fonts/router.ts'
import fontAssetsRouter from './font-assets/router.ts'
import limitsRouter from './limits/router.ts'

export const apiRouters = {
  '/groups': groupRouter,
  '/portals': portalsRouter,
  '/pages': pagesRouter,
  '/reuses': reusesRouter,
  '/images': imagesRouter,
  '/identities': identitiesRouter,
  '/admin': adminRouter,
  '/fonts': fontsRouter,
  '/font-assets': fontAssetsRouter,
  '/limits': limitsRouter
}
