import neostandard from 'neostandard'
import pluginVue from 'eslint-plugin-vue'
import dfLibRecommended from '@data-fair/lib-utils/eslint/recommended.js'
import pluginVuetify from 'eslint-plugin-vuetify'

export default [
  ...dfLibRecommended,
  ...pluginVue.configs['flat/recommended'],
  ...pluginVuetify.configs['flat/recommended'],
  {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },
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
    rules: {
      'no-unused-expressions': 'off',
      'no-undef': 'off' // typescript takes care of this with autoImport support
    }
  },
  { ignores: ['dist/*', 'dts/*', 'src/components/vjsf/*'] },
]
