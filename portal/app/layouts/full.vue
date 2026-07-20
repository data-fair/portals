<template>
  <LayoutSkipLinks :targets="skipLinkTargets" />
  <LayoutFullAppBar />
  <v-main>
    <v-container
      id="contenu"
      fluid
      class="pa-0 h-100"
      tabindex="-1"
    >
      <slot />
    </v-container>
  </v-main>
  <LayoutScrollToTop />
</template>

<script setup lang="ts">

const skipLinkTargets = [
  { id: 'contenu', labelKey: 'content' }
]

</script>

<style>
/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
