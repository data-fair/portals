<template>
  <LayoutAppBar :portal-config="$portalConfig" />
  <v-main>
    <v-container>
      <slot />
    </v-container>
  </v-main>
</template>
