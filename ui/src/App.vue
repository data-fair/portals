<template>
  <v-app>
    <v-main>
      <RouterView />
      <ui-notif />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import uiNotif from '@data-fair/lib-vuetify/ui-notif.vue'

</script>

<style>
@import '@data-fair/portals-shared-markdown/style.css';

/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
