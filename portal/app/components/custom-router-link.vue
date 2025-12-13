<template>
  <client-only v-if="to">
    <custom-router-link-client
      :to="to"
      :rel="rel"
      :target="target"
    >
      <slot />
    </custom-router-link-client>
    <template #fallback>
      <!-- this will be rendered on server side -->
       <router-link
        :to="to"
        style="text-decoration: none; color: inherit;"
        :rel="rel"
        :target="target"
      >
        <slot />
      </router-link>
    </template>
  </client-only>
  <a
    v-else-if="href"
    :href="href"
    style="text-decoration: none; color: inherit;"
    :rel="rel"
    :target="target"
  >
    <slot />
  </a>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const { to } = defineProps<{
  to?: RouteLocationRaw,
  href?: string,
  target?: string,
  rel?: string
}>()
</script>
