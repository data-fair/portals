import { createUiNotif } from '@data-fair/lib-vue/ui-notif.js'
import { fr, en } from 'vuetify/locale'
import { createRulesPlugin } from 'vuetify/labs/rules'

export default defineNuxtPlugin((nuxtApp) => {
  const themeCookie = useCookie<'default' | 'hc' | 'dark' | 'hc-dark'>('theme', { default: () => 'default' })
  const langCookie = useCookie<'fr' | 'en'>('i18n_lang', { default: () => 'fr' })

  const portalConfig = useNuxtApp().$portal.config
  let colors = portalConfig.theme.colors
  let dark = false

  if (themeCookie.value === 'hc' && portalConfig.theme.hcColors) {
    colors = portalConfig.theme.hcColors
  }
  if (themeCookie.value === 'dark' && portalConfig.theme.darkColors) {
    colors = portalConfig.theme.darkColors
    dark = true
  }
  if (themeCookie.value === 'hc-dark' && portalConfig.theme.hcDarkColors) {
    colors = portalConfig.theme.hcDarkColors
    dark = true
  }

  // https://nuxt.vuetifyjs.com/guide/nuxt-runtime-hooks.html

  nuxtApp.hook('vuetify:before-create', ({ vuetifyOptions }) => {
    vuetifyOptions.locale = {
      locale: langCookie.value,
      fallback: 'en',
      messages: { fr, en }
    }
    vuetifyOptions.theme = {
      // TODO: cspNonce
      defaultTheme: themeCookie.value,
      themes: {
        [themeCookie.value]: {
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
    }
  })

  nuxtApp.hook('vuetify:ready', (vuetify) => {
    nuxtApp.vueApp.use(createRulesPlugin({ }, vuetify.locale))
    nuxtApp.vueApp.use(createUiNotif())
  })
})
