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
    privateDirectoryUrl: 'http://simple-directory:8080',
    mongoUrl: 'mongodb://localhost:27017/data-fair-portals',
    draftUrlPattern: ''
  },
  // cf https://vuetifyjs.com/en/getting-started/installation/#using-nuxt-3
  build: {
    transpile: ['vuetify']
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
  },
  app: {
    head: {
      link: [{ rel: 'stylesheet', href: '/simple-directory/api/sites/_theme.css', blocking: 'render' }]
    }
  }
})
