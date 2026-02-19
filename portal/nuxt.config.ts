// https://nuxt.com/docs/api/configuration/nuxt-config

import { defaultNonceCSPDirectives } from '@data-fair/lib-express/serve-spa'

// cf https://nuxt-security.vercel.app/headers/csp
const contentSecurityPolicy: Record<string, string[]> = {}
for (const [name, value] of Object.entries(defaultNonceCSPDirectives)) {
  contentSecurityPolicy[name] = value.replace('{NONCE}', '{{nonce}}').split(' ')
}
// for now we are force to use unsafe-inline for vuetify theme
contentSecurityPolicy['style-src'] = ["'self'", "'unsafe-inline'"]
// strict-dynamic necessary for analytics
contentSecurityPolicy['script-src']!.push("'strict-dynamic'")

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
    mainPublicUrl: 'http://localhost:5610',
    privateDirectoryUrl: 'http://simple-directory:8081',
    mongoUrl: 'mongodb://localhost:27022/data-fair-portals',
    portalUrlPattern: '',
    frameAncestors: '',
    secretIgnoreRateLimiting: '',
    elasticsearchNodes: 'http://localhost:9205',
    elasticsearchAuth: '',
    elasticsearchCA: ''
  },
  security: {
    nonce: true,
    headers: {
      // this blocks iframes starting with a / is better covered by CSP anyway
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy
    },
    // we use rate-limiting on reverse proxy instead
    rateLimiter: false
  },
  // cf https://vuetifyjs.com/en/getting-started/installation/#using-nuxt-3
  build: {
    transpile: ['vuetify']
  },
  components: [
    { path: '~/components', pathPrefix: false }
  ],
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
    'vuetify-nuxt-module'
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
  app: {
    head: {
      title: 'Open Data Portal', // default fallback title
      charset: 'utf-8' // overrides default 'utf-16' for smaller size
    }
  },
  css: [
    '@data-fair/lib-vuetify/style/global.scss',
    '@data-fair/portals-shared-markdown/style.css',
    'vuetify/lib/components/VTable/VTable.css' // Ensure VTable styles are included, as the component is used in markdown rendering
  ],
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'd-frame'
    }
  },
  vuetify: {
    moduleOptions: {
      ssrClientHints: {
        // reloadOnFirstRequest: false, // disabled because broken with Brave unfortunately
        viewportSize: true
      }
    },
    vuetifyOptions: {
      directives: true,
      icons: { defaultSet: 'mdi-svg' },
      defaults: {
        VCard: {
          // white card with light grey border by default
          variant: 'flat',
          border: 'sm'
        }
      }
    }
  }
})
