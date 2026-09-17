<template>
  <footer-element-images
    v-if="element.type === 'images'"
    :element="element"
  />
  <footer-element-text
    v-else-if="element.type === 'text'"
    :element="element"
  />
  <footer-element-links
    v-else-if="element.type === 'links'"
    :element="element"
  />
  <footer-element-buttons
    v-else-if="element.type === 'buttons'"
    :element="element"
  />
  <footer-element-social
    v-else-if="element.type === 'social'"
    :element="element"
  />
  <footer-element-divider
    v-else-if="element.type === 'divider'"
    :element="element"
  />
</template>

<script setup lang="ts">
import type { FooterElement } from '#api/types/footer-elements/index.ts'

defineProps<{ element: FooterElement }>()
</script>
