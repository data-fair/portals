<template>
  <LayoutSkipLinks :targets="skipLinkTargets" />
  <LayoutFullAppBar />
  <v-main>
    <div
      id="contenu"
      tabindex="-1"
      class="h-100"
    >
      <slot />
    </div>
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
