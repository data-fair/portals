// https://nuxt.com/docs/api/configuration/nuxt-config

import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defaultNonceCSPDirectives } from '@data-fair/lib-express/serve-spa'

// cf https://nuxt-security.vercel.app/headers/csp
const contentSecurityPolicy: Record<string, string[]> = {}
for (const [name, value] of Object.entries(defaultNonceCSPDirectives)) {
  contentSecurityPolicy[name] = value.replace('{NONCE}', '{{nonce}}').split(' ')

  // for now we are force to use unsafe-inline for vuetify theme
  if (name === 'style-src') contentSecurityPolicy[name] = ["'self'", "'unsafe-inline'"]
}

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
    nonce: true,
    headers: {
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false,
      originAgentCluster: false,
      referrerPolicy: 'strict-origin-when-cross-origin',
      strictTransportSecurity: false,
      // contentSecurityPolicy
      contentSecurityPolicy: false
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
