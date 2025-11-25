<template>
  <LayoutFullAppBar />
  <client-only><accept-cookies /></client-only>
  <v-main>
    <v-container fluid class="pa-0 h-100">
      <slot />
    </v-container>
  </v-main>
  <LayoutScrollToTop />
</template>

<style>
/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
