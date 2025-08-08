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
    <template #page-elements="{elements, childKey}">
      <slot
        name="page-elements"
        :elements="elements"
        :child-key="childKey"
      >
        <page-element
          v-for="(child, i) of elements"
          :key="i"
          :element="child"
        />
      </slot>
    </template>
  </page-element-card>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page'

defineProps({
  element: { type: Object as () => PageElement, required: true }
})
</script>
