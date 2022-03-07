const fs = require('fs-extra')
let config = require('config')
config.basePath = new URL(config.publicUrl + '/').pathname

const isBuilding = process.argv.slice(-1)[0] === 'build'

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('@koumoul/nuxt-config-inject')
  if (isBuilding) config = nuxtConfigInject.prepare(config)
  else {
    fs.removeSync('.nuxt-standalone')
    fs.copySync('.nuxt', '.nuxt-standalone')
    nuxtConfigInject.replace(config)
    nuxtConfigInject.replace({ ...config, basePath: '/' }, ['.nuxt-standalone/**/*'])
  }
}

let vuetifyOptions = {}

if (process.env.NODE_ENV !== 'production' || isBuilding) {
  const fr = require('vuetify/es5/locale/fr').default
  vuetifyOptions = {
    customVariables: ['~assets/variables.scss'],
    treeShake: true,
    defaultAssets: false,
    theme: {
      themes: {
        light: {
          primary: '#1E88E5', // blue.darken1
          secondary: '#42A5F5', // blue.lighten1,
          accent: '#FF9800', // orange.base
          error: 'FF5252', // red.accent2
          info: '#2196F3', // blue.base
          success: '#4CAF50', // green.base
          warning: '#E91E63', // pink.base
          admin: '#E53935' // red.darken1
        },
        dark: {
          primary: '#42A5F5', // colors.blue.lighten1,
          accent: '#FF9800' // colors.orange.base
        }
      }
    },
    lang: {
      locales: { fr },
      current: 'fr'
    }
  }
}

module.exports = {
  ssr: true,
  components: true,
  srcDir: 'public/',
  telemetry: false,
  build: {
    transpile: [
      /@koumoul/,
      'vuetify/lib',
      // 'vuetify',
      // 'vuedraggable',
      'vue-clamp',
      'resize-detector',
      'sanitize-html',
      'pbkdf2' // this is a nuxt dep, but weirdly without this line we have a ie11 crash
    ],
    extend (webpackConf, { isServer, isDev, isClient }) {
      // Loader for sounds
      webpackConf.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      })
    }
  },
  loading: { color: '#1e88e5' }, // Customize the progress bar color
  plugins: [
    { src: '~plugins/axios-errors' },
    { src: '~plugins/init' },
    { src: '~plugins/theme' },
    { src: '~plugins/typography' },
    { src: '~plugins/filters' },
    { src: '~plugins/sanitize' },
    { src: '~/plugins/dayjs' },
    { src: '~/plugins/color' },
    { src: '~plugins/polyfill', ssr: false },
    { src: '~plugins/analytics', ssr: false },
    { src: '~plugins/window-size' },
    { src: '~plugins/ws', ssr: false },
    { src: '~plugins/session', ssr: false },
    { src: '~plugins/auth', ssr: false },
    { src: '~plugins/breadcrumbs.js', ssr: false }
  ],
  router: {
    base: config.basePath
  },
  modules: ['@nuxtjs/axios', 'cookie-universal-nuxt', 'vue-social-sharing/nuxt'],
  axios: {
    browserBaseURL: config.basePath,
    baseURL: 'http://localhost:' + config.port
  },
  buildModules: [
    'nuxt-webpack-optimisations',
    '@nuxtjs/vuetify',
    ['@nuxtjs/google-fonts', { download: true, display: 'swap', families: { Nunito: [100, 300, 400, 500, 700, 900] } }]
  ],
  vuetify: vuetifyOptions,
  env: {
    mainPublicUrl: config.publicUrl,
    mainDataFairUrl: config.dataFairUrl,
    development: process.env.NODE_ENV === 'development',
    copyright: config.copyright
  },
  head: {
    title: 'Portail de données',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' }
    ]
  },
  css: [
    '@mdi/font/css/materialdesignicons.min.css'
  ]
}

/*
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
*/
