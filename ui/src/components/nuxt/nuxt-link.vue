<template>
  <a
    href="#"
    @click.prevent
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
console.warn('A nuxt-link component is used in portals-manager')
</script>
