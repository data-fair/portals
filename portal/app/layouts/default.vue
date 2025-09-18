<template>
  <LayoutAppBar />
  <v-main>
    <v-container>
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter />
  <LayoutScrollToTop />
</template>
