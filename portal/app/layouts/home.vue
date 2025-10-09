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

<style lang="scss" scoped>
@use 'sass:map';
@use 'vuetify/settings' as v;

// When the screen is exactly 1280px (xl threshold), keep the lg width
.v-container {
  $xl-threshold: map.get(v.$grid-breakpoints, 'xl') + 1px;

  @media (max-width: #{$xl-threshold}) {
    max-width: map.get(v.$grid-breakpoints, 'lg') !important;
  }
}
</style>
