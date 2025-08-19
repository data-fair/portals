<template>
  <page-element-title
    v-if="element.type === 'title'"
    :element="element"
  />
  <page-element-text
    v-else-if="element.type === 'text'"
    :element="element"
  />
  <page-element-alert
    v-else-if="element.type === 'alert'"
    :element="element"
  />
  <page-element-image
    v-else-if="element.type === 'image'"
    :element="element"
  />
  <page-element-divider
    v-else-if="element.type === 'divider'"
    :element="element"
  />
  <page-element-card
    v-else-if="element.type === 'card'"
    :element="element"
  >
    <template #page-elements="context">
      <slot
        name="page-elements"
        v-bind="context"
      />
    </template>
  </page-element-card>
  <page-element-two-columns
    v-else-if="element.type === 'two-columns'"
    :element="element"
  >
    <template #page-elements="context">
      <slot
        name="page-elements"
        v-bind="context"
      />
    </template>
  </page-element-two-columns>
  <page-element-tabs
    v-else-if="element.type === 'tabs'"
    :element="element"
  >
    <template #page-elements="context">
      <slot
        name="page-elements"
        v-bind="context"
      />
    </template>
  </page-element-tabs>
</template>

<script setup lang="ts">
import type { PageElement } from '~~/../api/types/page'
import PageElementTitle from './page-element-title.vue'
import PageElementText from './page-element-text.vue'
import PageElementAlert from './page-element-alert.vue'
import PageElementImage from './page-element-image.vue'
import PageElementDivider from './page-element-divider.vue'
import PageElementCard from './page-element-card.vue'
import PageElementTwoColumns from './page-element-two-columns.vue'
import PageElementTabs from './page-element-tabs.vue'

defineProps({
  element: { type: Object as () => PageElement, required: true }
})
</script>
