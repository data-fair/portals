// alternate nuxtConfig for when the service is exposed on a separate domain name for a standalone portal

let config = require('config')
config.basePath = '/'

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('@koumoul/nuxt-config-inject')
  if (process.argv.slice(-1)[0] === 'build') config = nuxtConfigInject.prepare(config)
  else nuxtConfigInject.replace(config, ['.nuxt-standalone'])
}

module.exports = require('./nuxt.config.common')(config, '.nuxt-standalone')
