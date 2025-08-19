<template>
  <component
    :is="element.titleSize"
    :class="cssClass"
  >
    {{ element.content }}
  </component>
</template>

<script setup lang="ts">
import type { Titre1 } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Titre1, required: true }
})

const cssClass = computed(() => {
  const margins = {
    h6: '2',
    h5: '3',
    h4: '4',
    h3: '5',
    h2: '6',
    h1: '7'
  }
  let res = `text-${element.titleSize || 'h3'} my-${margins[element.titleSize] || '4'}`
  if (element.centered) res += ' text-center'
  return res
})
</script>
