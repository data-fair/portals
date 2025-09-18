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
