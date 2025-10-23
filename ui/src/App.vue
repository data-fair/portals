<template>
  <v-app>
    <v-main>
      <RouterView />
      <ui-notif />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import uiNotif from '@data-fair/lib-vuetify/ui-notif.vue'

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portals-manager/api/images/${id}/data`
})
</script>

<style>
@import '@data-fair/portals-shared-markdown/style.css';

/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
