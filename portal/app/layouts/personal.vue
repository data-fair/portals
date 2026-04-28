<template>
  <ClientOnly>
    <LayoutPersonalNavigation />
    <LayoutPersonalAppBar />
    <v-main>
      <v-container fluid class="pa-0 h-100">
        <slot />
      </v-container>
    </v-main>
    <LayoutScrollToTop />
  </ClientOnly>
</template>

<script setup lang="ts">
useHead({
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<style>
/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
