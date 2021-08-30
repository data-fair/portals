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
const dbUtils = require('./utils/db')
const { createProxyMiddleware } = require('http-proxy-middleware')
const nuxt = require('./nuxt')
const session = require('@koumoul/sd-express')({
  directoryUrl: config.directoryUrl,
})
const debug = require('debug')('main')

const publicHost = new URL(config.publicUrl).host
debug('Public host', publicHost)

// Second express application for proxying requests based on host
const app = express()

if (process.env.NODE_ENV === 'development') {
  // Create a mono-domain environment with other services in dev
  app.use('/simple-directory', createProxyMiddleware({ target: 'http://localhost:6201', pathRewrite: { '^/simple-directory': '' } }))
  app.use('/data-fair', createProxyMiddleware({ target: 'http://localhost:8080', pathRewrite: { '^/data-fair': '' }, ws: true }))
  app.use('/openapi-viewer', createProxyMiddleware({ target: 'http://localhost:6202', pathRewrite: { '^/openapi-viewer': '' } }))
  app.use('/notify', createProxyMiddleware({ target: 'http://localhost:8088', pathRewrite: { '^/notify': '' } }))
}

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.text())

app.use(session.auth)
app.set('session', session)
app.use('/api/v1/portals', require('./router/portals'))

// set current baseUrl, i.e. the url of the service on the current user's domain
const basePath = new URL(config.publicUrl).pathname
app.use('/', (req, res, next) => {
  const u = originalUrl(req)
  req.publicBaseUrl = u.full ? formatUrl({ protocol: u.protocol, hostname: u.hostname, port: u.port, pathname: basePath.slice(0, -1) }) : config.publicUrl
  req.publicWsBaseUrl = req.publicBaseUrl.replace('http:', 'ws:').replace('https:', 'wss:')
  req.publicBasePath = basePath
  next()
})

let httpServer
async function main() {
  const nuxtMiddleware = await nuxt()
  app.use(nuxtMiddleware)

  const { client, db } = await dbUtils.init()
  app.set('db', db)
  app.set('client', client)

  const transport = nodemailer.createTransport(config.mails.transport)
  transport.sendMailAsync = require('util').promisify(transport.sendMail)
  app.set('mailTransport', transport)

  app.use((err, req, res, next) => {
    console.error('Error in HTTP request', err.response ? err.response.data : err)
    res.status(err.status || 500).send(err.message)
  })

  httpServer = http.createServer(app).listen(config.port)
  await event2promise(httpServer, 'listening')
  debug('HTTP server is listening', config.port)
}

main().then(() => {
  console.log('Running on ' + config.publicUrl)
}, err => {
  console.error(err)
  process.exit(-1)
})

process.on('SIGTERM', async function onSigterm () {
  console.info('Received SIGTERM signal, shutdown gracefully...')
  try {
    if (httpServer) {
      httpServer.close()
      await event2promise(httpServer, 'close')
    }
    console.log('shutting down now')
    process.exit()
  } catch (err) {
    console.error('Failure while stopping service', err)
    process.exit(-1)
  }
})
