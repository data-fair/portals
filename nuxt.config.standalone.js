// alternate nuxtConfig for when the service is exposed on a separate domain name for a standalone portal

const config = require('config')
config.basePath = '/'

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('@koumoul/nuxt-config-inject')
  if (process.argv.slice(-1)[0] === 'build') throw new Error('the standalone is not meant to be built, just executed on a copy of the normal build')
  else nuxtConfigInject.replace(config, ['.nuxt-standalone'])
}

module.exports = require('./nuxt.config.common')(config, '.nuxt-standalone')
