<template>
  <LayoutAppBar :home="true" />
  <v-main style="position: relative">
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter :home="true" />
  <LayoutScrollToTop />
</template>
