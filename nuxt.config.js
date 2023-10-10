const fs = require('fs-extra')
let config = require('config')
config.basePath = new URL(config.publicUrl + '/').pathname

const isBuilding = process.argv.filter(a => !a.startsWith('--')).slice(-1)[0] === 'build'

if (process.env.NODE_ENV === 'production') {
  const nuxtConfigInject = require('@koumoul/nuxt-config-inject')
  if (isBuilding) config = nuxtConfigInject.prepare(config)
  else {
    fs.removeSync('nuxt-dist-standalone')
    fs.copySync('nuxt-dist', 'nuxt-dist-standalone')
    nuxtConfigInject.replace(config, ['nuxt-dist/**/*'])
    nuxtConfigInject.replace({ ...config, basePath: '/' }, ['nuxt-dist-standalone/**/*'])
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
  standalone: true,
  components: true,
  srcDir: 'public/',
  buildDir: 'nuxt-dist',
  telemetry: false,
  build: {
    // always the same url to fetch static resource, even in multi-domain mode
    // publicPath: config.publicUrl + '/_nuxt/', // this is broken for some reason, too bad
    transpile: [
      /@koumoul/,
      /@data-fair/,
      'vue-clamp',
      'resize-detector',
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
    },
    // extract css in separate files
    // this might create some slight clipping, but much better for caching
    extractCSS: true,
    splitChunks: {
      layouts: true
    }
  },
  loading: { color: '#1e88e5' }, // Customize the progress bar color
  plugins: [
    { src: '~plugins/axios-errors' },
    { src: '~plugins/init' },
    { src: '~plugins/theme' },
    { src: '~plugins/typography' },
    { src: '~plugins/filter-bytes' },
    { src: '~plugins/dayjs' },
    { src: '~plugins/polyfill', ssr: false },
    { src: '~plugins/analytics', ssr: false },
    { src: '~plugins/window-size' },
    { src: '~plugins/ws', ssr: false },
    { src: '~plugins/session', ssr: false },
    { src: '~plugins/auth', ssr: false }
  ],
  router: {
    base: config.basePath
  },
  modules: ['@nuxtjs/axios', 'cookie-universal-nuxt', 'vue-social-sharing/nuxt', ['@nuxtjs/i18n', {
    seo: true,
    locales: [{ code: 'fr', iso: 'fr-FR' }],
    defaultLocale: config.i18n.defaultLocale,
    vueI18nLoader: true,
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang'
    },
    vueI18n: {
      fallbackLocale: config.i18n.defaultLocale
    }
  }]],
  axios: {
    browserBaseURL: config.basePath,
    baseURL: 'http://localhost:' + config.port
  },
  buildModules: [
    '@nuxtjs/vuetify',
    ['@nuxtjs/google-fonts', { download: true, display: 'swap', families: { Nunito: [100, 300, 400, 500, 700, 900] } }]
  ],
  vuetify: vuetifyOptions,
  env: {
    mainPublicUrl: config.publicUrl,
    mainDataFairUrl: config.dataFairUrl,
    processingsUrl: config.processingsUrl,
    development: process.env.NODE_ENV === 'development',
    copyright: config.copyright,
    i18n: config.i18n,
    tablePreviewPath: config.tablePreviewPath,
    whiteLabelOwners: config.whiteLabelOwners
  },
  head: {
    title: 'Portail de données',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui' }
    ]
  },
  css: [
    '@mdi/font/css/materialdesignicons.min.css',
    '@/assets/main.css'
  ],
  // a way to render sitemap.xml from inside nuxt
  hooks: {
    render: {
      route (url, result, context) {
        if (url.split('?')[0].endsWith('.xml')) {
          const match = result.html.match(/<xml(.*?)>(.*)<\/xml>/)
          if (match) {
            result.xml = true
            result.html = match[2].replace(/<!---->/g, '')
          }
        }
      },
      beforeResponse (url, result, context) {
        if (result.xml) context.res.setHeader('Content-Type', 'application/xml')
      }
    }
  }
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
