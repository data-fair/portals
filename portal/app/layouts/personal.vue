<template>
  <ClientOnly>
    <LayoutSkipLinks :targets="skipLinkTargets" />
    <LayoutPersonalNavigation />
    <LayoutPersonalAppBar />
    <v-main>
      <div
        id="contenu"
        tabindex="-1"
      >
        <v-container fluid class="pa-0 h-100">
          <slot />
        </v-container>
      </div>
    </v-main>
    <LayoutScrollToTop />
  </ClientOnly>
</template>

<script setup lang="ts">

const skipLinkTargets = [
  { id: 'contenu', labelKey: 'content' },
  { id: 'sidebar-navigation', labelKey: 'sidebarNavigation' }
]

</script>

<style>
/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
