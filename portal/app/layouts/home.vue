<template>
  <LayoutAppBar :home="true" :portal-config="$portalConfig" />
  <v-container>
    <slot />
  </v-container>
</template>
