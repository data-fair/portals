<template>
  <v-list>
    <v-list-item
      v-for="(link, j) of children"
      :key="j"
      :title="link.title"
      :append-icon="link.type === 'submenu' && link.children.length ? mdiChevronRight : undefined"
      :to="link.type !== 'external' && link.type !== 'submenu' ? useResolveLink(link) : undefined"
      :href="link.type === 'external' ? link.href : undefined"
      :target="link.type === 'external' ? '_blank' : undefined"
      :rel="link.type === 'external' ? 'noopener' : undefined"
    >
      <v-menu
        v-if="link.type === 'submenu' && link.children?.length"
        :open-on-focus="false"
        activator="parent"
        open-on-hover
        submenu
      >
        <nav-tabs-menu-item  :children="link.children"/>
      </v-menu>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { MenuItem } from '#api/types/portal'
import { mdiChevronRight } from '@mdi/js'

defineProps<{
  children: MenuItem[]
}>()

</script>
