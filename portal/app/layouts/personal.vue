<template>
  <LayoutPersonalNavigationDrawer :home="true" :portal-config="$portalConfig" />
  <LayoutPersonalAppBar :home="true" :portal-config="$portalConfig" />
  <v-main>
    <v-container>
      <slot />
    </v-container>
  </v-main>
  <LayoutScrollToTop />
</template>
