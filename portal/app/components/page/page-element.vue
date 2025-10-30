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
    :context="context"
  />
  <page-element-iframe
    v-else-if="element.type === 'iframe'"
    :element="element"
  />
  <page-element-divider
    v-else-if="element.type === 'divider'"
    :element="element"
  />
  <page-element-search
    v-else-if="element.type === 'search'"
    :element="element"
    :context="context"
  />
  <page-element-topics
    v-else-if="element.type === 'topics'"
    :element="element"
  />
  <page-element-metrics
    v-else-if="element.type === 'metrics'"
    :element="element"
  />
  <page-element-contact
    v-else-if="element.type === 'contact'"
    :element="element"
  />
  <page-element-datasets-list
    v-else-if="element.type === 'datasets-list'"
    :element="element"
  />
  <page-element-dataset-card
    v-else-if="element.type === 'dataset-card'"
    :element="element"
  />
  <page-element-dataset-table
    v-else-if="element.type === 'dataset-table'"
    :element="element"
  />
  <page-element-dataset-form
    v-else-if="element.type === 'dataset-form'"
    :element="element"
  />
  <page-element-applications-list
    v-else-if="element.type === 'applications-list'"
    :element="element"
  />
  <page-element-application
    v-else-if="element.type === 'application'"
    :element="element"
  />
  <page-element-banner
    v-else-if="element.type === 'banner'"
    :element="element"
    :context="context"
  >
    <template #page-elements="vjsfContext">
      <slot
        name="page-elements"
        v-bind="vjsfContext"
      />
    </template>
  </page-element-banner>
  <page-element-card
    v-else-if="element.type === 'card'"
    :element="element"
  >
    <template #page-elements="vjsfContext">
      <slot
        name="page-elements"
        v-bind="vjsfContext"
      />
    </template>
  </page-element-card>
  <page-element-two-columns
    v-else-if="element.type === 'two-columns'"
    :element="element"
  >
    <template #page-elements="vjsfContext">
      <slot
        name="page-elements"
        v-bind="vjsfContext"
      />
    </template>
  </page-element-two-columns>
  <page-element-tabs
    v-else-if="element.type === 'tabs'"
    :element="element"
  >
    <template #page-elements="vjsfContext">
      <slot
        name="page-elements"
        v-bind="vjsfContext"
      />
    </template>
  </page-element-tabs>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page'

defineProps<{
  element: PageElement
  context: {
    isRoot: boolean
    index: number
    parentLength: number
  }
}>()
</script>
