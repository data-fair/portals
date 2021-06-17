const webpack = require('webpack')
const fr = require('vuetify/es5/locale/fr').default

module.exports = (config, buildDir = '.nuxt') => ({
  buildDir,
  ssr: true,
  components: true,
  srcDir: 'public/',
  build: {
    transpile: [
      /@koumoul/,
      'vuetify/lib',
      // 'vuetify',
      // 'vuedraggable',
      'vue-clamp',
      'resize-detector',
      'pbkdf2', // this is a nuxt dep, but weirly without this line we have a ie11 crash
    ],
    extend (webpackConf, { isServer, isDev, isClient }) {
      // Ignore all locale files of moment.js, those we want are loaded in plugins/moment.js
      webpackConf.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))

      // webpackConf.output.publicPath = config.publicUrl + '/_nuxt/'

      // Loader for sounds
      webpackConf.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      })
    },
    publicPath: config.publicUrl + '/_nuxt/',
  },
  loading: { color: '#1e88e5' }, // Customize the progress bar color
  plugins: [
    { src: '~plugins/axios-errors' },
    { src: '~plugins/init' },
    { src: '~plugins/typography' },
    { src: '~plugins/moment' },
    { src: '~plugins/filters' },
    { src: '~plugins/polyfill', ssr: false },
    { src: '~plugins/analytics', ssr: false },
    { src: '~plugins/window-size', ssr: false },
    { src: '~plugins/ws', ssr: false },
    { src: '~plugins/session', ssr: false },
    { src: '~plugins/auth', ssr: false },
    { src: '~plugins/theme', ssr: false },
    { src: '~plugins/breadcrumbs.js', ssr: false },
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
          primary: '#1E88E5', // blue.darken1
          secondary: '#42A5F5', // blue.lighten1,
          accent: '#FF9800', // orange.base
          error: 'FF5252', // red.accent2
          info: '#2196F3', // blue.base
          success: '#4CAF50', // green.base
          warning: '#E91E63', // pink.base
          admin: '#E53935', // red.darken1
        },
        dark: {
          primary: '#42A5F5', // colors.blue.lighten1,
          accent: '#FF9800', // colors.orange.base
        },
      },
    },
    lang: {
      locales: { fr },
      current: 'fr',
    },
  },
  env: {
    publicUrl: config.publicUrl,
    directoryUrl: config.directoryUrl,
    dataFairUrl: config.dataFairUrl,
    openapiViewerUrl: config.openapiViewerUrl,
    notifyUrl: config.notifyUrl,
    notifyWSUrl: config.notifyWSUrl,
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
})
