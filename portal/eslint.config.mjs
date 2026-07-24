import pluginTs from '@typescript-eslint/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import pluginVuetify from 'eslint-plugin-vuetify'
import neostandard from 'neostandard'
import withNuxt from './.nuxt/eslint.config.mjs'

// Same layout as ui/eslint.config.mjs: vue first so .vue files get vue-eslint-parser,
// then vuetify, then neostandard. @nuxt/eslint runs with standalone false (see
// nuxt.config), so it only contributes its Nuxt rules and no second
// @typescript-eslint instance.
export default withNuxt([
  // standalone false also drops the ignores Nuxt normally contributes
  { ignores: ['.nuxt/*', '.output/*', 'dist/*', 'public/*'] },
  ...pluginVue.configs['flat/recommended'],
  ...pluginVuetify.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  },
  ...neostandard({ ts: true }),
  {
    plugins: { '@typescript-eslint': pluginTs },
    rules: {
      'vue/no-multiple-template-root': 'off',
      'vue/require-default-prop': 'off',
      // pages and layouts are named after their route, not in multiple words
      'vue/multi-word-component-names': 'off',
      // auto-imports are resolved by typescript, eslint cannot see them
      'no-undef': 'off',
      // was enabled by the Nuxt preset before standalone was turned off, and the
      // codebase already carries disable comments for it
      '@typescript-eslint/no-explicit-any': 'error'
    }
  }
])
