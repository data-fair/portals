import type { AppliedTheme, Theme } from '@data-fair/lib-vue/session.js'
import { createUiNotif } from '@data-fair/lib-vue/ui-notif.js'
import { fr, en } from 'vuetify/locale'

// vuetify-nuxt-module's useState('vuetify:nuxt:ssr-client-hints') shape — we only read prefers-color-scheme
interface VuetifySSRClientHints {
  prefersColorScheme?: 'dark' | 'light' | 'no-preference'
}

export default defineNuxtPlugin((nuxtApp) => {
  const themeCookie = useCookie<Theme | undefined>('theme')
  const langCookie = useCookie<'fr' | 'en'>('i18n_lang', { default: () => 'fr' })

  const portalConfig = useNuxtApp().$portal.config

  // https://nuxt.vuetifyjs.com/guide/advanced/runtime-hooks.html
  nuxtApp.hook('vuetify:before-create', ({ vuetifyOptions }) => {
    const applied = resolvePortalTheme(themeCookie.value)
    let colors = portalConfig.theme.colors
    let dark = false
    if (applied === 'hc' && portalConfig.theme.hcColors) {
      colors = portalConfig.theme.hcColors
    }
    if (applied === 'dark' && portalConfig.theme.darkColors) {
      colors = portalConfig.theme.darkColors
      dark = true
    }
    if (applied === 'hc-dark' && portalConfig.theme.hcDarkColors) {
      colors = portalConfig.theme.hcDarkColors
      dark = true
    }

    vuetifyOptions.locale = {
      locale: langCookie.value,
      fallback: 'en',
      messages: { fr, en }
    }

    vuetifyOptions.theme = {
      // No cspNonce: nuxt-security already nonces every <style>; passing it would yield a duplicate attribute.
      defaultTheme: applied,
      themes: {
        [applied]: {
          dark,
          colors,
          variables: {
            // disable partial transparencies for precise color control and readable contrast
            'high-emphasis-opacity': 1,
            'medium-emphasis-opacity': 0.87
          }
        }
      }
    }
  })

  nuxtApp.hook('vuetify:ready', () => {
    nuxtApp.vueApp.use(createUiNotif())
  })

  // SSR variant of resolveTheme: on 'system', read prefers-color-scheme from the SSR Client Hint
  // (exposed by vuetify-nuxt-module's ssrClientHints) and fall back to matchMedia on the client.
  // Sec-CH-Forced-Colors exists but vuetify-nuxt-module doesn't expose it, so HC can't be
  // auto-picked at SSR — it requires an explicit user choice.
  function resolvePortalTheme (theme: Theme | undefined): AppliedTheme {
    // Honor an explicit choice only while the portal still offers that theme.
    // 'default' is always available; 'dark'/'hc'/'hc-dark' depend on the config flags.
    // A theme disabled after the user picked it falls through to the system resolution
    // below, so the user isn't stuck on a theme the (now hidden) switcher no longer exposes.
    if (theme === 'default') return 'default'
    if (theme === 'dark' && portalConfig.theme.dark) return 'dark'
    if (theme === 'hc' && portalConfig.theme.hc) return 'hc'
    if (theme === 'hc-dark' && portalConfig.theme.hcDark) return 'hc-dark'

    let prefersDark = false
    let prefersHC = false
    if (import.meta.server) {
      const hints = useState<VuetifySSRClientHints | undefined>('vuetify:nuxt:ssr-client-hints')
      prefersDark = hints.value?.prefersColorScheme === 'dark'
    } else {
      prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
      prefersHC = window.matchMedia?.('(forced-colors: active)').matches ?? false
    }

    if (portalConfig.theme.hcDark && prefersDark && prefersHC) return 'hc-dark'
    if (portalConfig.theme.hc && prefersHC) return 'hc'
    if (portalConfig.theme.dark && prefersDark) return 'dark'
    return 'default'
  }
})
