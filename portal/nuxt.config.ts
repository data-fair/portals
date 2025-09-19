// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

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
      },
      {
        from: 'vue-i18n',
        imports: ['useI18n']
      }
    ]
  },
  modules: [
    '@nuxt/eslint', 'nuxt-security',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins!.push(vuetify({ autoImport: true }))
      })
    },
    // ...
  ],
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    plugins: [
      VueI18nPlugin(),
    ],
  },
  app: {
    head: {
      link: [{ rel: 'stylesheet', href: '/simple-directory/api/sites/_theme.css', blocking: 'render' }]
    }
  }
})
