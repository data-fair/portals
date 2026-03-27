import path from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'vue-router/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Vuetify from 'vite-plugin-vuetify'
import microTemplate from '@data-fair/lib-utils/micro-template.js'
import { autoImports } from '@data-fair/lib-vue/vite.js'
import { settingsPath } from '@data-fair/lib-vuetify/vite.js'
import { commonjsDeps } from '@koumoul/vjsf/utils/build.js'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/portals-manager',
  // pre-bundle dependencies to avoid full page reloads during dev
  // cf https://vite.dev/guide/dep-pre-bundling.html
  optimizeDeps: {
    include: [
      'debug',
      'easymde',
      ...commonjsDeps,
      '@data-fair/frame/lib/d-frame.js',
      '@data-fair/frame/lib/vue-router/use-parent-url.js',
      '@data-fair/lib-common-types/theme/index.js',
      '@data-fair/lib-utils/micro-template.js',
      '@data-fair/lib-utils/marked-vuetify.js',
      '@data-fair/lib-utils/sanitize-html.js',
      '@koumoul/vjsf/composables/use-vjsf.js',
      '@vueuse/core',
      'fast-deep-equal',
      'sanitize-html',
      'marked',
      'ofetch'
    ]
  },
  resolve: {
    alias: {
      '#portal': path.resolve(__dirname, '../portal'),
      '~': path.resolve(__dirname, 'src/')
    }
  },
  html: {
    cspNonce: '{CSP_NONCE}'
  },
  plugins: [
    VueRouter({
      dts: './dts/typed-router.d.ts',
      exclude: process.env.NODE_ENV === 'development' ? [] : ['src/pages/dev.vue', 'src/pages/topics.vue']
    }),
    Vue({ template: { compilerOptions: { isCustomElement: (tag) => ['d-frame'].includes(tag) } } }),
    VueI18nPlugin({ strictMessage: false }),
    Vuetify({ styles: { configFile: settingsPath } }),
    AutoImport({
      dts: './dts/auto-imports.d.ts',
      vueTemplate: true,
      imports: [
        ...autoImports,
        {
          '~/context': ['$uiConfig', '$sitePath', '$cspNonce', '$apiPath', '$fetch']
        }
      ],
      dirs: [
        'src/utils',
        'src/composables'
      ]
    }),
    Components({
      dts: './dts/components.d.ts',
      dirs: [
        'src/components',
        '../portal/app/components'
      ]
    }),
    {
      name: 'inject-site-context',
      async transformIndexHtml (html) {
        // in production this injection will be performed by an express middleware
        if (process.env.NODE_ENV !== 'development') return html
        const { uiConfigPath } = (await import('@data-fair/lib-express')).prepareUiConfig((await import('../api/src/ui-config.ts')).uiConfig)
        return microTemplate(html, { SITE_PATH: '', UI_CONFIG_PATH: uiConfigPath, THEME_CSS_HASH: '', PUBLIC_SITE_INFO_HASH: '' })
      }
    }
  ],
  experimental: {
    renderBuiltUrl (filename, { hostType }) {
      if (hostType === 'html') return '{SITE_PATH}/portals-manager/' + filename
      return { relative: true }
    }
  },
  server: { hmr: { port: 7200 } }
})
