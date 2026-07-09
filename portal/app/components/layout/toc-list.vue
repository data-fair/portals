<template>
  <v-list
    bg-color="transparent"
    density="compact"
    color="primary"
    class="py-2"
    nav
  >
    <v-list-subheader>{{ t('tableOfContents') }}</v-list-subheader>

    <v-list-item
      v-for="section in sections"
      :key="section.id"
      :active="activeId === section.id"
      @click="emit('select', section.id)"
    >
      <!-- text-wrap lets long titles wrap instead of being truncated (the portals_v1 regression) -->
      <v-list-item-title class="text-wrap">{{ section.title }}</v-list-item-title>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

type TocSection = NonNullable<PageConfig['_toc']>[number]

defineProps<{ sections: TocSection[], activeId: string | null }>()
const emit = defineEmits<{ select: [id: string] }>()

const { t } = useI18n({ useScope: 'local' })
</script>

<i18n lang="yaml">
fr:
  tableOfContents: Sommaire
en:
  tableOfContents: Table of contents
</i18n>
