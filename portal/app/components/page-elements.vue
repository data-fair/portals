<template>
  <page-element
    v-for="(element, i) of elements"
    :key="i"
    :element="element"
    :context="{
      isRoot: root,
      index: i,
      parentLength: elements?.length || 0
    }"
  >
    <template #page-elements="{ elements: childrenElements }">
      <page-elements
        :model-value="childrenElements"
        :root="false"
      />
    </template>
  </page-element>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'

withDefaults(defineProps<{ root?: boolean }>(), {
  root: true
})

const elements = defineModel<PageElement[]>()

</script>
