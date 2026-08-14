<template>
  <ClientOnly>
    <LayoutSkipLinks :targets="skipLinkTargets" />
    <LayoutPersonalNavigation />
    <LayoutPersonalAppBar />
    <v-main>
      <div
        id="contenu"
        tabindex="-1"
        class="h-100"
      >
        <v-container
          class="pa-0 h-100"
          fluid
        >
          <slot />
        </v-container>
      </div>
    </v-main>
    <LayoutScrollToTop />
  </ClientOnly>
</template>

<script setup lang="ts">
// The personal space has no footer (see the P15 dérogation), so only two targets.
const skipLinkTargets = [
  { id: 'contenu', labelKey: 'content' },
  { id: 'sidebar-navigation', labelKey: 'sidebarNavigation' }
]

useHead({
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<style>
/* https://stackoverflow.com/questions/56973002/vuetify-adds-scrollbar-when-its-not-needed */
html { overflow-y: auto; }
</style>
