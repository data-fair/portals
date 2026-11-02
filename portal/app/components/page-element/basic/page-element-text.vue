<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`, element.centered && 'text-center']"
    style="overflow-wrap: break-word;"
    v-html="annotateLinks(element._html)"
  />
</template>

<script setup lang="ts">
import type { TextElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps({
  element: { type: Object as () => TextElement, required: true }
})
const { annotateLinks } = useNavigationStore()
</script>
