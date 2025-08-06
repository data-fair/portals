<template>
  <page-element :element="element">
    <template #elements-list="{elements}">
      <page-element
        v-for="(child, i) of elements"
        :key="i"
        :element="child"
      />
    </template>
  </page-element>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => PageElement, required: true }
})
</script>
