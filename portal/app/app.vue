<template>
  <v-app :class="{ 'v-app--legacy-layout': $portal.md2Compat }">
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
      <ClientOnly><UiNotif /></ClientOnly>
      <ClientOnly><AcceptCookies /></ClientOnly>
    </NuxtLayout>
    <ClientOnly>
      <AgentChat :portal-config="$portal.config" :portal-id="$portal._id" :owner="$portal.owner" :locale="locale" :local-fetch="$localFetch" />
    </ClientOnly>
  </v-app>
</template>

<script setup lang="ts">
import UiNotif from '@data-fair/lib-vuetify/ui-notif.vue'
import { toRef } from 'vue'
import { useTheme } from 'vuetify'
import { usePortalAgentHost } from './composables/agent/use-portal-agent-host'

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
const navigationStore = provideNavigationStore({ isIframe })

// Register the portal-level WebMCP host (frame server + base tools) so agent
// tools are available on the tab BroadcastChannel before any page renders.
if (import.meta.client) {
  usePortalAgentHost({
    locale: toRef(() => locale.value),
    localFetch: $localFetch,
    portalConfig: $portal.config,
    portalId: $portal._id,
    navigationStore
  })
}

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

// Style global des liens texte (a.simple-link, y compris markdown).
// Le sélecteur double .simple-link.simple-link bat la règle générée par le
// _theme.css de simple-directory (.v-theme--<name> a.simple-link) quel que
// soit l'ordre de chargement.
const linksCss = computed(() => {
  const cfg = $portal.config.linksConfig
  const underline = cfg?.underline ?? 'always'
  const sel = '.v-application a.simple-link.simple-link'
  const rules: string[] = []
  const underlineColor = cfg?.underlineColor ? `rgb(var(--v-theme-${cfg.underlineColor}))` : undefined
  const decorationColor = underlineColor ? `text-decoration-color:${underlineColor};` : ''
  if (underline === 'always') {
    rules.push(`${sel}{text-decoration:underline;text-underline-offset:2px;${decorationColor}}`)
  } else if (underline === 'always-grow') {
    rules.push(`${sel}{text-decoration:underline;text-underline-offset:2px;${decorationColor}}`)
    rules.push(`${sel}:hover,${sel}:focus-visible{text-decoration-thickness:2px;}`)
  } else if (underline === 'hover') {
    rules.push(`${sel}:hover,${sel}:focus-visible{text-decoration:underline;text-underline-offset:2px;${decorationColor}}`)
  } else if (underline === 'hover-grow') {
    rules.push(`${sel}{text-decoration:none;position:relative;}`)
    rules.push(`${sel}::after{content:"";position:absolute;left:0;bottom:-3px;width:45px;height:3px;background-color:${underlineColor ?? 'currentColor'};transform:scaleX(0);transform-origin:left;transition:transform .25s ease-out;}`)
    rules.push(`${sel}:hover::after,${sel}:focus-visible::after{transform:scaleX(1);}`)
    rules.push(`@media (prefers-reduced-motion: reduce){${sel}::after{transition:none;}}`)
  }
  if (cfg?.color && cfg.color !== 'primary') {
    const colorValue = cfg.color === 'secondary'
      ? `rgb(var(--v-theme-text-${cfg.color}, var(--v-theme-${cfg.color})))`
      : `rgb(var(--v-theme-${cfg.color}))`
    rules.push(`${sel}{color:${colorValue};}`)
  }
  return rules.join('')
})
useHead({ style: () => linksCss.value ? [{ key: 'portal-links-css', textContent: linksCss.value }] : [] })
</script>

<style>
/* Full-bleed banners break out to width:100vw, which includes the vertical
   scrollbar width and would otherwise add a few px of horizontal overflow — a
   thin gutter down the right edge, only visible once scrolled past the banner
   (e.g. when landing on an anchor). Clip it here while keeping the full-bleed. */
.v-application {
  overflow-x: clip;
}

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
/* Legacy typography: restore Vuetify 3 MD2 letter-spacing on buttons/tabs */
.v-app--legacy-layout .v-btn {
  letter-spacing: 0.0892857143em;
}
</style>
