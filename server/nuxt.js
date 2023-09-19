const config = require('config')
const memoize = require('memoizee')
const asyncWrap = require('./utils/async-wrap')

const getPortalFromHost = memoize(async (db, host) => {
  return db.collection('portals').findOne({ host: { $eq: host } }, { projection: { _id: true } })
}, {
  normalizer ([db, host]) {
    return host
  },
  maxAge: process.env.NODE_ENV === 'development' ? 1000 : 30000
})

module.exports = async () => {
  if (config.proxyNuxt) {
    // in dev mode the nuxt dev server is already running, we re-expose it
    return require('http-proxy-middleware').createProxyMiddleware({ target: 'http://localhost:3039' })
  } else if (process.env.NODE_ENV === 'test') {
    // no UI during tests
    return (req, res, next) => next()
  } else {
    const { Nuxt } = require('nuxt-start')
    const nuxtConfig = require('../nuxt.config.js')

    // Prepare nuxt for rendering and serving UI
    const nuxt = new Nuxt({ ...nuxtConfig, dev: false })
    // alternate nuxtConfig for when the service is exposed on a separate domain name for a standalone portal
    const nuxtStandaloneConfig = { ...nuxtConfig, buildDir: 'nuxt-dist-standalone', dev: false }
    nuxtStandaloneConfig.router = { ...nuxtConfig.router, base: '/' }
    nuxtStandaloneConfig.axios = { ...nuxtStandaloneConfig.axios, browserBaseURL: '/' }
    const nuxtStandalone = new Nuxt(nuxtStandaloneConfig)
    return asyncWrap(async (req, res, next) => {
      // accept buffering and caching of this response in the reverse proxy
      res.setHeader('X-Accel-Buffering', 'yes')
      if (!req.query.portalId) {
        const host = req.headers.host
        const portal = await getPortalFromHost(req.app.get('db'), host)
        if (portal) {
          req.headers['x-portal-id'] = portal._id
          return nuxtStandalone.render(req, res)
        }
      }

      // re-apply the prefix that was removed by an optional reverse proxy
      req.url = (nuxtConfig.router.base + req.url).replace('//', '/')
      return nuxt.render(req, res, next)
    })
  }
}
