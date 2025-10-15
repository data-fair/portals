<template>
  <component
  :is="element.titleSize"
  :class="cssClass"
  >
    <v-icon
      v-if="element.icon"
      :icon="element.icon?.svgPath"
      :color="element.color"
      size="small"
      style="top:-2px"
      start
    />
    {{ element.content }}
  </component>
</template>

<script setup lang="ts">
import type { Titre1 } from '#api/types/page-config'

const { element } = defineProps<{ element: Titre1 }>()

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
  if (element.color) res += ` text-${element.color}`
  return res
})
</script>
