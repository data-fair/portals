<template>
  <v-defaults-provider :defaults="previewDefaults">
    <!-- the block sits on the page background in the portal, and needs it here too: the
         surrounding form is painted by the theme of the back-office, not the portal's. A
         v-sheet, not a bg-background class: v-theme-provider renders no element of its own,
         so only a vuetify component carries the preview theme vars -->
    <v-sheet
      v-if="renderedElement"
      color="background"
    >
      <page-element
        :element="renderedElement"
        :context="context"
      >
        <template #page-elements="{ elements, onUpdate, addItemMessage }">
          <page-edit-elements
            :model-value="elements"
            :add-item-message="addItemMessage"
            :pages="pages"
            @update:model-value="(newElements: PageElement[] | undefined) => element = onUpdate(newElements ?? [])"
          />
        </template>
      </page-element>
    </v-sheet>
  </v-defaults-provider>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'

const element = defineModel<PageElement>()
defineProps<{ context: { isRoot: boolean, index: number, parentLength: number }, pages: any }>()

const renderedElement = computed(() => {
  if (!element.value) return
  if ((element.value.type === 'text' || element.value.type === 'alert') && element.value.content) {
    return { ...element.value, _html: renderMarkdown(element.value.content ?? '') }
  }
  return element.value
})

const previewDefaults = {
  // counteract the density defined by vjsf in edit mode
  global: { density: 'default' },
  'VjsfList-VCard': {
    border: false
  }
}
</script>
