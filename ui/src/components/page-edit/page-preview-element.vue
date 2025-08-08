<template>
  <page-element
    v-if="renderedElement"
    :element="renderedElement"
  >
    <template #page-elements="{childKey, elements}">
      <v-defaults-provider :defaults="{'VjsfList-VCard': {border: false}}">
        <page-edit-elements
          :model-value="elements"
          @update:model-value="onElementsUpdate($event, childKey)"
        />
      </v-defaults-provider>
    </template>
  </page-element>
</template>

<script setup lang="ts">
import { parse as marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import type { PageElement } from '#api/types/page-config'

const element = defineModel<PageElement>()

const renderedElement = computed(() => {
  if (!element.value) return
  if (element.value.type === 'text') {
    return { ...element.value, content: sanitizeHtml(marked(element.value.content) as string) }
  }
  return element.value
})

const onElementsUpdate = (elements: PageElement[], childKey: string) => {
  if (!element.value) return
  element.value[childKey] = elements
}
</script>
