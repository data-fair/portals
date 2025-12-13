<template>
  <template v-if="!to">
    <slot />
  </template>
  <router-link
    v-else
    :to="to"
    :href="href"
    target="_top"
    style="text-decoration: none; color: inherit;"
  >
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import useParentUrl from '@data-fair/frame/lib/vue-router/use-parent-url.js'
import { RouteLocationRaw, useRouter } from 'vue-router'

const { to } = defineProps<{ to?: RouteLocationRaw }>()
const href = useParentUrl(() => to ?? '', useRouter())
</script>
