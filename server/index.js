const config = require('config')
const { start, stop } = require('./app')

start().then(() => {
  console.log('Running on ' + config.publicUrl)
}, err => {
  console.error(err)
  process.exit(-1)
})

process.on('SIGTERM', async function onSigterm () {
  console.info('Received SIGTERM signal, shutdown gracefully...')
  try {
    await stop()
    console.log('shutting down now')
    process.exit()
  } catch (err) {
    console.error('Failure while stopping service', err)
    process.exit(-1)
  }
})
