<template>
  <v-app :class="{ 'v-app--legacy-layout': $portal.legacyLayout }">
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
      <ClientOnly><UiNotif /></ClientOnly>
      <ClientOnly><AcceptCookies /></ClientOnly>
    </NuxtLayout>
    <ClientOnly><AgentChat :portal-config="$portal.config" :portal-id="$portal._id" :owner="$portal.owner" :locale="locale" :local-fetch="$localFetch" /></ClientOnly>
  </v-app>
</template>

<script setup lang="ts">
import UiNotif from '@data-fair/lib-vuetify/ui-notif.vue'
import { useTheme } from 'vuetify'

const { $portal, $siteInfo, $localFetch } = useNuxtApp()
const session = useSession()
const { locale } = useI18n()
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

const meta = [
  { name: 'theme-color', content: String(theme.current.value.colors.primary) },
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

<style>
[tabindex="-1"]:focus {
  outline: none;
}

.text-two-lines {
  white-space: unset !important;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  min-height: 2lh;
}

/* Legacy layout: restore Vuetify 3-like container max-widths */
@media (min-width: 840px) {
  .v-app--legacy-layout .v-container:not(.v-container--fluid) { max-width: 900px; }
}
@media (min-width: 1145px) {
  .v-app--legacy-layout .v-container:not(.v-container--fluid) { max-width: 1200px; }
}
@media (min-width: 1545px) {
  .v-app--legacy-layout .v-container:not(.v-container--fluid) { max-width: 1800px; }
}
@media (min-width: 2138px) {
  .v-app--legacy-layout .v-container:not(.v-container--fluid) { max-width: 2400px; }
}
/* Force 1280px for most desktop screens (same as prod override) */
@media (max-width: 1921px) {
  .v-app--legacy-layout .v-container:not(.v-container--fluid) { max-width: 1280px !important; }
}
</style>
