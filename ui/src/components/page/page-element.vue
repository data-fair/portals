<template>
  <page-element-title
    v-if="element.type === 'title'"
    :element="element"
  />
  <page-element-text
    v-else-if="element.type === 'text'"
    :element="element"
  />
  <page-element-card
    v-else-if="element.type === 'card'"
    :element="element"
  >
    <template #elements-list="{elements, childKey}">
      <slot
        name="elements-list"
        :elements="elements"
        :child-key="childKey"
      />
    </template>
  </page-element-card>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page'

defineProps({
  element: { type: Object as () => PageElement, required: true }
})
</script>
