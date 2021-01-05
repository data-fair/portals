const webpack = require('webpack')
const cors = require('cors')
let config = require('config')
config.basePath = new URL(config.publicUrl + '/').pathname

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('@koumoul/nuxt-config-inject')
  if (process.argv.slice(-1)[0] === 'build') config = nuxtConfigInject.prepare(config)
  else nuxtConfigInject.replace(config)
}

module.exports = {
  srcDir: 'public/',
  build: {
    transpile: [
      /@koumoul/,
      'vuetify',
      // 'vuedraggable',
      'vue-clamp',
      'resize-detector',
      'pbkdf2', // this is a nuxt dep, but weirly without this line we have a ie11 crash
    ],
    extend (webpackConf, { isServer, isDev, isClient }) {
      // Ignore all locale files of moment.js, those we want are loaded in plugins/moment.js
      webpackConf.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))

      // webpackConf.output.publicPath = config.publicUrl + '/_nuxt/'
    },
    publicPath: config.publicUrl + '/_nuxt/',
  },
  loading: { color: '#1e88e5' }, // Customize the progress bar color
  plugins: [
    { src: '~plugins/init' },
    { src: '~plugins/typography' },
    { src: '~plugins/moment' },
    { src: '~plugins/filters' },
    { src: '~plugins/polyfill', ssr: false },
    { src: '~plugins/analytics', ssr: false },
    { src: '~/plugins/window-size', ssr: false },
  ],
  router: {
    base: config.basePath,
  },
  modules: ['@nuxtjs/axios', 'cookie-universal-nuxt', 'vue-social-sharing/nuxt'],
  axios: {
    browserBaseURL: config.basePath,
    baseURL: config.publicUrl,
    credentials: true,
  },
  buildModules: ['@nuxtjs/vuetify'],
  vuetify: {
    defaultAssets: {
      font: {
        family: 'Nunito',
      },
    },
    icons: {
      iconfont: 'mdi',
    },
    theme: {
      themes: {
        light: {
          primary: '#1E88E5', // colors.blue.darken1
          // primary: colors.blue.lighten1, // code near our logo 'dark' blue
          accent: '#F57C00', // colors.orange.darken2
          warning: '#F57C00', // colors.orange.darken2
        },
        dark: {
          primary: '#42A5F5', // colors.blue.lighten1,
          accent: '#FF9800', // colors.orange.base
        },
      },
    },
  },
  env: {
    publicUrl: config.publicUrl,
    directoryUrl: config.directoryUrl,
    dataFairUrl: config.dataFairUrl,
    openapiViewerUrl: config.openapiViewerUrl,
    sessionDomain: config.sessionDomain,
    development: process.env.NODE_ENV === 'development',
  },
  head: {
    title: 'Portail de données',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' },
    ],
  },
}

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
