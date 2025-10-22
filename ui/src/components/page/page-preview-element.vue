<template>
  <v-defaults-provider :defaults="previewDefaults">
    <page-element
      v-if="renderedElement"
      :element="renderedElement"
      :context="context"
    >
      <template #page-elements="{ elements, onUpdate, addItemMessage }">
        <v-defaults-provider :defaults="vjsfDefaults">
          <page-edit-elements
            :model-value="elements"
            :add-item-message="addItemMessage"
            @update:model-value="(newElements: PageElement[] | undefined) => element = onUpdate(newElements ?? [])"
          />
        </v-defaults-provider>
      </template>
    </page-element>
  </v-defaults-provider>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-config'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'

const element = defineModel<PageElement>()
defineProps<{ context: { isRoot: boolean, index: number, parentLength: number } }>()

const renderedElement = computed(() => {
  if (!element.value) return
  if (element.value.type === 'text' && element.value.content) {
    return { ...element.value, _html: renderMarkdown(element.value.content ?? '') }
  }
  return element.value
})

const previewDefaults = {
  // counteract the density defined by vjsf in edit mode
  global: { density: 'default' }
}

const vjsfDefaults = { 'VjsfList-VCard': { border: false } }

/* const onElementsUpdate = (elements: PageElement[], childKey: string, ) => {
  if (!element.value) return
  console.log('onElementsUpdate', childKey, elements)
  const newValue = { ...element.value }
  const childKeyParts = childKey.split('.')
  if (childKeyParts.length === 2) {
    // @ts-ignore
    newValue[childKeyParts[0]] = { ...newValue[childKeyParts[0]], [childKeyParts[1]]: elements }
  } else {
    newValue[childKeyParts[0]] = elements
  }
  element.value = newValue
} */
</script>
