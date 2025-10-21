<template>
  <!-- Direct link items -->
  <li v-if="item.type !== 'submenu'" class="mb-2 d-flex align-center">
    <NuxtLink :to="resolveLink(item)">{{ resolveLinkTitle(item, locale) }}</NuxtLink>
  </li>

  <!-- Submenu items -->
  <template v-else-if="item.type === 'submenu' && item.children?.length">
    <li class="mb-2">
      <div class="text-h6">{{ item.title }}</div>
      <ul class="mb-2 ps-4 ms-1 border-s" style="list-style: none;">
        <sitemap-menu-item
          v-for="(child, i) in item.children"
          :key="i"
          :item="child"
        />
      </ul>
    </li>
  </template>
</template>

<script setup lang="ts">
import type { MenuItem, LinkItem } from '#api/types/portal'

defineProps<{
  item: MenuItem | LinkItem
}>()

const { locale } = useI18n()
const { resolveLink, resolveLinkTitle } = useNavigationStore()
</script>
