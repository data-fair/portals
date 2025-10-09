// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  devServer: {
    port: 5657
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  alias: {
    '#api/types': '../../api/types'
  },
  runtimeConfig: {
    mainPublicUrl: 'http://localhost:5607',
    privateDirectoryUrl: 'http://simple-directory:8080',
    mongoUrl: 'mongodb://localhost:27017/data-fair-portals',
    draftUrlPattern: ''
  },
  security: {
    headers: {
      contentSecurityPolicy: {
        // allow images from self, data URLs and HTTPS sources
        'img-src': ["'self'", 'data:', 'https:']
      }
    }
  },
  // cf https://vuetifyjs.com/en/getting-started/installation/#using-nuxt-3
  build: {
    transpile: ['vuetify']
  },
  imports: {
    presets: [
      {
        from: '@data-fair/lib-vue/session.js',
        imports: ['useSession', 'useSessionAuthenticated']
      },
      {
        from: '@data-fair/lib-vue/locale-dayjs.js',
        imports: ['useLocaleDayjs']
      },
      {
        from: '@data-fair/lib-vue/reactive-search-params.js',
        imports: ['useStringSearchParam', 'useNumberSearchParam', 'useBooleanSearchParam', 'useStringsArraySearchParam']
      }
    ]
  },
  modules: [
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    'nuxt-security',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins!.push(vuetify({ autoImport: true }))
      })
    },
    // ...
  ],
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang',
      redirectOn: 'root'
    }
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    }
  },
  app: {
    head: {
      title: 'Open Data Portal', // default fallback title
      charset: 'utf-8', // overrides default 'utf-16' for smaller size
      link: [{ rel: 'stylesheet', href: '/simple-directory/api/sites/_theme.css', blocking: 'render' }]
    }
  }
})
