// https://nuxt.com/docs/api/configuration/nuxt-config
import { defaultNonceCSPDirectives } from '@data-fair/lib-express/serve-spa'

// cf https://nuxt-security.vercel.app/headers/csp
const contentSecurityPolicy: Record<string, string[]> = {}
for (const [name, value] of Object.entries(defaultNonceCSPDirectives)) {
  contentSecurityPolicy[name] = value.replace('{NONCE}', '{{nonce}}').split(' ')
}
// unsafe-inline is required for vuetify inline style attributes (style="...") on elements
// nonces only work on <style> tags, not on element style attributes
contentSecurityPolicy['style-src'] = ["'self'", "'unsafe-inline'"]
// strict-dynamic necessary for analytics
contentSecurityPolicy['script-src']!.push("'strict-dynamic'")

export default defineNuxtConfig({
  // TODO: remove when nitropack properly calls esbuild.stop() after build
  hooks: {
    close: () => { process.exit(0) }
  },
  devServer: {
    port: parseInt(process.env.DEV_PORTAL_PORT!)
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
  // pre-bundle dependencies to avoid full page reloads during dev
  // cf https://vite.dev/guide/dep-pre-bundling.html
  vite: {
    optimizeDeps: {
      include: [
        '@analytics/google-analytics',
        '@data-fair/lib-vue/session.js',
        '@data-fair/lib-vue/ui-notif.js',
        '@data-fair/lib-vue/locale-dayjs.js',
        '@data-fair/lib-vue/async-action.js',
        '@data-fair/lib-utils/micro-template.js',
        '@data-fair/lib-vue/reactive-search-params.js',
        '@data-fair/frame/lib/d-frame.js',
        '@data-fair/frame/lib/vue-router/d-frame-content.js',
        '@data-fair/frame/lib/vue-router/state-change-adapter.js',
        '@vueuse/core',
        '@mdi/js',
        'analytics'
      ]
    }
  },
  vue: { compilerOptions: { isCustomElement: (tag: string) => tag === 'd-frame' } },
  vuetify: {
    moduleOptions: {
      styles: {
        colors: false,
        configFile: '@data-fair/lib-vuetify/style/settings.scss'
      },
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
  },
  // recommended by vuetify-nuxt-module
  // https://nuxt.vuetifyjs.com/guide/features/ssr.html#vuetify-sass-variables
  features: {
    inlineStyles: false
  }
})
