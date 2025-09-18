<template>
  <LayoutAppBar :home="true" />
  <v-main>
    <v-container>
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter :home="true" />
  <LayoutScrollToTop />
</template>
