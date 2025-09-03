<template>
  <LayoutAppBar :home="true" :portal-config="$portalConfig" />
  <v-main>
    <v-container>
      <slot />
    </v-container>
  </v-main>
  <LayoutFooter :home="true" :portal-config="$portalConfig" />
  <LayoutScrollToTop />
</template>
