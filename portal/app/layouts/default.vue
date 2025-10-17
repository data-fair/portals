<template>
  <LayoutAppBar />
  <v-main>
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter />
  <LayoutScrollToTop />
</template>