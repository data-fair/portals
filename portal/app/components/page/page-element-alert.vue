<!-- eslint-disable vue/no-v-html -->
<template>
  <v-alert
    :type="element.alertType !== 'none' ? element.alertType : undefined"
    :title="element.title"
    :icon="element.icon?.svgPath"
    :color="element.color"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
  >
    <template #text>
      <div v-html="element._html" />
    </template>
  </v-alert>
</template>

<script setup lang="ts">
import type { AlertElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => AlertElement, required: true }
})
</script>
