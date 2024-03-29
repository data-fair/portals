/* eslint-disable no-new */
// code instrumentation to expose metrics for prometheus
// follow this doc for naming conventions https://prometheus.io/docs/practices/naming/
// /metrics serves container/process/pod specific metrics while /global-metrics
// serves metrics for the whole data-fair installation no matter the scaling

const config = require('config')
const express = require('express')
const client = require('prom-client')
const eventToPromise = require('event-to-promise')
const asyncWrap = require('./async-wrap')

const globalRegister = new client.Registry()

// metrics server
const app = express()
const server = require('http').createServer(app)
app.get('/metrics', asyncWrap(async (req, res) => {
  res.set('Content-Type', client.register.contentType)
  res.send(await client.register.metrics())
}))
app.get('/global-metrics', asyncWrap(async (req, res) => {
  res.set('Content-Type', globalRegister.contentType)
  res.send(await globalRegister.metrics())
}))

// local metrics incremented throughout the code
exports.internalError = new client.Counter({
  name: 'df_internal_error',
  help: 'Errors in some worker process, socket handler, etc.',
  labelNames: ['errorCode']
})

exports.start = async (db) => {
  // global metrics based on db connection
  new client.Gauge({
    name: 'df_portals_portals_total',
    help: 'Total number of portals',
    registers: [globalRegister],
    async collect () {
      this.set(await db.collection('portals').estimatedDocumentCount())
    }
  })

  server.listen(config.prometheus.port)
  await eventToPromise(server, 'listening')
  console.log('Prometheus metrics server listening on http://localhost:' + config.prometheus.port)
}

exports.stop = async () => {
  server.close()
  await eventToPromise(server, 'close')
}
