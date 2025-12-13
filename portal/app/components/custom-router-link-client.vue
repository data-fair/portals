<template>
  <router-link
    :to="to"
    :href="href ?? parentHref"
    :target="target ?? '_top'"
    :rel="rel"
    style="text-decoration: none; color: inherit;"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import useParentUrl from '@data-fair/frame/lib/vue-router/use-parent-url.js'
import type { RouteLocationRaw } from 'vue-router'

const { to, href } = defineProps<{
  to: RouteLocationRaw,
  href?: string,
  target?: string,
  rel?: string
}>()
const parentHref = useParentUrl(() => to, useRouter())
</script>
