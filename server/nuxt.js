const { Nuxt } = require('nuxt')

const nuxtConfig = require('../nuxt.config.js')
// alternate nuxtConfig for when the service is exposed on a separate domain name for a standalone portal
const nuxtConfigStandalone = require('../nuxt.config.standalone.js')

module.exports = async () => {
  if (process.env.NODE_ENV === 'development') {
    // in dev mode the nuxt dev server is already running, we re-expose it
    const { createProxyMiddleware } = require('http-proxy-middleware')
    return createProxyMiddleware({ target: 'http://localhost:3039' })
  } else {
    // Prepare nuxt for rendering and serving UI
    const nuxt = new Nuxt(nuxtConfig)
    const nuxtStandalone = new Nuxt(nuxtConfigStandalone)
    return async (req, res, next) => {
      if (!req.query.portalId) {
        const host = req.headers.host
        const portal = await req.app.get('db').collection('portals').findOne({ host }, { projection: { _id: true } })
        if (portal) {
          req.headers['x-portal-id'] = portal._id
          return nuxtStandalone.render(req, res)
        }
      }

      // re-apply the prefix that was removed by an optional reverse proxy
      req.url = (nuxtConfig.router.base + req.url).replace('//', '/')
      nuxt.render(req, res)
    }
  }
}
