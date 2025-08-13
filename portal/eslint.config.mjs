import pluginVuetify from 'eslint-plugin-vuetify'
import neostandard from 'neostandard'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt([
  ...pluginVuetify.configs['flat/recommended'],
  ...neostandard({ ts: true })
])
