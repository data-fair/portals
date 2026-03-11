<template>
  <div
    :class="[
      element.centered ? 'justify-center' : 'justify-start',
      element.mb !== 0 && `mb-${element.mb ?? 4}`
    ]"
    class="d-flex"
  >
    <v-icon
      v-if="element.icon && (element.icon.mdi?.svgPath || element.icon.custom)"
      :icon="element.icon.mdi?.svgPath || element.icon.custom"
      :color="element.icon.color"
      :size="element.size"
    />
  </div>
</template>

<script setup lang="ts">
import type { IconElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{
  element: IconElement
}>()
</script>
