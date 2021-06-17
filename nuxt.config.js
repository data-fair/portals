const cors = require('cors')
let config = require('config')
config.basePath = new URL(config.publicUrl + '/').pathname

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('@koumoul/nuxt-config-inject')
  if (process.argv.slice(-1)[0] === 'build') config = nuxtConfigInject.prepare(config)
  else nuxtConfigInject.replace(config)
}

module.exports = require('./nuxt.config.common')(config)

if (process.env.NODE_ENV === 'development') {
  module.exports.hooks = {
    build: {
      compile({ name, compiler }) {
        if (name === 'client') {
          // Replace the webpack hot module replacement for the webpack hot middleware
          // Necessary to support re-exposing the dev server behind a reverse proxy (as done by data-fair)
          const appEntry = compiler.options.entry.app
          const ind = appEntry.findIndex(e => e.includes('path=/__webpack_hmr'))
          if (ind >= 0) appEntry[ind] = appEntry[ind].replace('path=/__webpack_hmr', 'path=http://localhost:3039/__webpack_hmr')
        }
      },
    },
    render: {
      setupMiddleware(app) {
        // Also necessary for livereload through a reverse-proxy
        app.use(cors())
      },
    },
  }
}
