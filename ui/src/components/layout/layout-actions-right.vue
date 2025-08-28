<template>
  <v-navigation-drawer
    location="right"
    class="pt-6"
    permanent
    floating
    style="background-color: transparent;"
  >
    <template #default>
      <slot />
    </template>
  </v-navigation-drawer>
</template>
