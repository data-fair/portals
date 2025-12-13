<template>
  <client-only>
    <custom-router-link-client :to="to">
      <slot />
    </custom-router-link-client>
    <template #fallback>
      <!-- this will be rendered on server side -->
       <router-link
        :to="to"
        style="text-decoration: none; color: inherit;"
      >
        <slot />
      </router-link>
    </template>
  </client-only>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const { to } = defineProps<{ to: RouteLocationRaw }>()
</script>
