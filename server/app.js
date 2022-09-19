const config = require('config')
const express = require('express')
const http = require('http')
const { URL } = require('url')
const event2promise = require('event-to-promise')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const originalUrl = require('original-url')
const { format: formatUrl } = require('url')
const googleFonts = require('google-fonts-complete')
const EventEmitter = require('events')
const dbUtils = require('./utils/db')
const prometheus = require('./utils/prometheus')
const { createProxyMiddleware } = require('http-proxy-middleware')
const nuxt = require('./nuxt')
const session = require('@koumoul/sd-express')({
  directoryUrl: config.directoryUrl
})
const debug = require('debug')('main')

global.events = new EventEmitter()

const publicHost = new URL(config.publicUrl).host
debug('Public host', publicHost)

// Second express application for proxying requests based on host
const app = express()

if (process.env.NODE_ENV === 'development') {
  // Create a mono-domain environment with other services in dev
  app.use('/simple-directory', createProxyMiddleware({ target: 'http://localhost:8080', pathRewrite: { '^/simple-directory': '' } }))
  app.use('/data-fair', createProxyMiddleware({ target: 'http://localhost:6201', pathRewrite: { '^/data-fair': '' }, ws: true }))
  app.use('/openapi-viewer', createProxyMiddleware({ target: 'http://localhost:6202', pathRewrite: { '^/openapi-viewer': '' } }))
  app.use('/notify', createProxyMiddleware({ target: 'http://localhost:8088', pathRewrite: { '^/notify': '' } }))
  app.use('/capture', createProxyMiddleware({ target: 'http://localhost:8087', pathRewrite: { '^/capture': '' } }))
}

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.text())

app.use(session.auth)
app.set('session', session)
app.use('/api/v1', require('./router/root'))
app.use('/api/v1/portals', require('./router/portals'))

const fonts = Object.entries(googleFonts)
  .filter(entry => entry[1].subsets.includes('latin'))
  .map(([name, info]) => ({ source: 'google-fonts', name, category: info.category }))
app.get('/api/v1/fonts', (req, res, next) => {
  res.send(fonts)
})

// set current baseUrl, i.e. the url of the service on the current user's domain
const basePath = new URL(config.publicUrl).pathname
app.use('/', (req, res, next) => {
  const u = originalUrl(req)
  req.publicBaseUrl = u.full ? formatUrl({ protocol: u.protocol, hostname: u.hostname, port: u.port, pathname: basePath.slice(0, -1) }) : config.publicUrl
  req.publicWsBaseUrl = req.publicBaseUrl.replace('http:', 'ws:').replace('https:', 'wss:')
  req.publicBasePath = basePath
  next()
})

app.get('/reuses*', (req, res, next) => {
  res.redirect(req.publicBaseUrl + req.url.replace('/reuses', '/applications'))
})

let httpServer
exports.start = async () => {
  const nuxtMiddleware = await nuxt()
  // app.use(require('cors')())
  app.use(nuxtMiddleware)

  const { db, client } = await require('../upgrade')()
  await dbUtils.init(db)
  app.set('db', db)
  app.set('client', client)

  const transport = nodemailer.createTransport(config.mails.transport)
  transport.sendMailAsync = require('util').promisify(transport.sendMail)
  app.set('mailTransport', transport)

  app.use((err, req, res, next) => {
    const status = err.statusCode || err.status || 500
    if (status === 500) {
      console.error('(http) Error in express route', err)
      prometheus.internalError.inc({ errorCode: 'http' })
    }
    res.status(status).send(err.message)
  })

  if (config.prometheus.active) await prometheus.start(db)

  httpServer = http.createServer(app).listen(config.port)
  await event2promise(httpServer, 'listening')
  debug('HTTP server is listening', config.port)
}

exports.stop = async () => {
  if (httpServer) {
    httpServer.close()
    await event2promise(httpServer, 'close')
  }
  if (config.prometheus.active) await prometheus.stop()
}
