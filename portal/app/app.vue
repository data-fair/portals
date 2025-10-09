<template>
  <v-app>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
      <ClientOnly>
        <UiNotif />
      </ClientOnly>
    </NuxtLayout>
  </v-app>
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/page-elements'
import UiNotif from '@data-fair/lib-vuetify/ui-notif.vue'
import { useTheme } from 'vuetify'

const { $portal } = useNuxtApp()
const session = useSession()
const theme = useTheme()

const getImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}
const link = [
  $portal.config.favicon
    ? { rel: 'icon', type: 'image/png', href: getImageSrc($portal.config.favicon, false) }
    : undefined,
].filter(Boolean)

provideNavigationStore()
providePortalStore($portal)
provide('get-image-src', getImageSrc)

useHead({
  title: $portal.config.title,
  htmlAttrs: { lang: session.state.lang },
  meta: [
    { name: 'theme-color', content: theme.current.value.colors.primary },
    // { name: 'color-scheme', content: $portal.config.theme.dark ? 'light dark' : 'light' }
  ],
  link
})
</script>

<style>
/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
