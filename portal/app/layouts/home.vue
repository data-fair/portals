<template>
  <v-layout-app-bar :home="true" :portal-config="$portalConfig" />
  <v-container>
    <slot />
  </v-container>
</template>
