<template>
  <LayoutAppBar :home="true" />
  <v-main>
    <v-container class="container">
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter :home="true" />
  <LayoutScrollToTop />
</template>