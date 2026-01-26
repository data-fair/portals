<template>
  <v-app>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
      <ClientOnly><UiNotif /></ClientOnly>
      <ClientOnly><AcceptCookies /></ClientOnly>
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import UiNotif from '@data-fair/lib-vuetify/ui-notif.vue'
import { useTheme } from 'vuetify'

const { $portal, $siteInfo } = useNuxtApp()
const session = useSession()
const theme = useTheme()
const getPortalImageSrc = usePortalImageSrc()

// Detect if the page is displayed in an iframe via the Sec-Fetch-Dest header
// useState allows sharing the value between server and client
const isIframe = useState('isIframe', () => {
  if (import.meta.server) {
    const headers = useRequestHeaders()
    return headers['sec-fetch-dest'] === 'iframe'
  }
  return false
})

providePortalStore($portal, $siteInfo)
provideNavigationStore({ isIframe })
provide('is-iframe', isIframe)

const meta = [
  { name: 'theme-color', content: theme.current.value.colors.primary },
  { name: 'color-scheme', content: $portal.config.theme.dark ? 'light dark' : 'light' }
]
if ($portal.draft || !$portal.config.allowRobots) meta.push({ name: 'robots', content: 'noindex' })
const link = $portal.config.favicon ? [{ rel: 'icon', type: 'image/png', href: getPortalImageSrc($portal.config.favicon, false) }] : []

useHead({
  title: $portal.config.title,
  htmlAttrs: { lang: session.state.lang },
  meta,
  link
})
</script>

<style lang="scss">
@use 'sass:map';
@use 'vuetify/settings' as v;

// When the screen is exactly 1280px (xl threshold), keep the lg width
.container {
  $xl-threshold: map.get(v.$grid-breakpoints, 'xl') + 1px;

  @media (max-width: #{$xl-threshold}) {
    max-width: map.get(v.$grid-breakpoints, 'lg') !important;
  }
}
</style>
