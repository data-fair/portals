<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`, element.centered && 'text-center']"
    style="overflow-wrap: break-word;"
    v-html="element._html"
  />
</template>

<script setup lang="ts">
import type { Texte } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Texte, required: true }
})
</script>
