<template>
  <router-link
    v-if="to"
    :to="to"
    :href="href"
    target="_top"
    style="text-decoration: none; color: inherit;"
  >
    <slot />
  </router-link>
  <a
    v-else-if="href"
    :href="href"
    style="text-decoration: none; color: inherit;"
  >
    <slot />
  </a>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
import useParentUrl from '@data-fair/frame/lib/vue-router/use-parent-url.js'
import { RouteLocationRaw, useRouter } from 'vue-router'

const { to } = defineProps<{ to?: RouteLocationRaw }>()
const href = useParentUrl(() => to ?? '', useRouter())
</script>
