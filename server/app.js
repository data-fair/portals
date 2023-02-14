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
const EventEmitter = require('events')
const dbUtils = require('./utils/db')
const prometheus = require('./utils/prometheus')
const { createProxyMiddleware } = require('http-proxy-middleware')
const nuxt = require('./nuxt')
const session = require('@data-fair/sd-express')({
  directoryUrl: config.directoryUrl,
  privateNotifyUrl: config.privateNotifyUrl
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

// set current baseUrl, i.e. the url of the service on the current user's domain
const publicUrl = new URL(config.publicUrl)
app.use('/', (req, res, next) => {
  const u = originalUrl(req)
  if (u.hostname === publicUrl.hostname) req.publicBaseUrl = config.publicUrl
  else req.publicBaseUrl = formatUrl({ protocol: u.protocol, hostname: u.hostname })
  next()
})

app.get('/reuses*', (req, res, next) => {
  const redirectUrl = req.publicBaseUrl + req.originalUrl.replace('/reuses', '/applications')
  console.log('redirect reuse', req.originalUrl, redirectUrl)
  res.redirect(redirectUrl)
})

let httpServer
exports.start = async () => {
  const nuxtMiddleware = await nuxt()
  // app.use(require('cors')())
  app.get('/robots.txt', (req, res) => {
    if (req.publicBaseUrl === config.publicUrl) {
      return res.status(400).send('robots;txt only served on standalone portals')
    }
    res.set('Content-Type', 'text/plain')
    res.send(`User-agent: *
Allow: /
    
Sitemap: ${req.publicBaseUrl}/sitemap.xml`)
  })
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
