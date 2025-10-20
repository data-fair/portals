<template>
  <LayoutAppBar />
  <v-main style="position: relative">
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter />
  <LayoutScrollToTop />
</template>
