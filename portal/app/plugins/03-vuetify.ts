import '@data-fair/lib-vuetify/style/global.scss'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { fr, en } from 'vuetify/locale'

export default defineNuxtPlugin((app) => {
  const theme = useCookie<'default' | 'hc' | 'dark' | 'hc-dark'>('theme', { default: () => 'default' })
  const lang = useCookie<'fr' | 'en'>('i18n_lang', { default: () => 'fr' })
  const portalConfig = useNuxtApp().$portalConfig!
  let colors = portalConfig.theme.colors
  let dark = false
  if (theme.value === 'hc' && portalConfig.theme.hcColors) {
    colors = portalConfig.theme.hcColors
  }
  if (theme.value === 'dark' && portalConfig.theme.darkColors) {
    colors = portalConfig.theme.darkColors
    dark = true
  }
  if (theme.value === 'hc-dark' && portalConfig.theme.hcDarkColors) {
    colors = portalConfig.theme.hcDarkColors
    dark = true
  }
  const vuetify = createVuetify({
    locale: {
      locale: lang.value,
      messages: { fr, en }
    },
    theme: {
      // TODO: cspNonce
      defaultTheme: theme.value,
      themes: {
        [theme.value]: {
          dark,
          colors,
          variables: {
          // deactivate automatic partial transparencies
          // best to control colors precisely and ensure sufficient contrast for readability
            'high-emphasis-opacity': 1,
            'medium-emphasis-opacity': 0.87
          }
        }
      }
    },
    icons: { defaultSet: 'mdi', aliases, sets: { mdi } },
    defaults: {
      VCard: {
        // white card with light grey border by default
        variant: 'flat',
        border: 'sm'
      }
    }
  })
  app.vueApp.use(vuetify)
})
