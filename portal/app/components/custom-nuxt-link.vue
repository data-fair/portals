<template>
  <client-only>
    <custom-nuxt-link-client :to="to" />
    <template #fallback>
      <!-- this will be rendered on server side -->
       <nuxt-link
        :to="to"
        target="_top"
        style="text-decoration: none; color: inherit;"
      >
        <slot />
      </nuxt-link>
    </template>
  </client-only>
</template>

<script setup lang="ts">
defineProps<{ to: string }>()
</script>
