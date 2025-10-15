<!-- eslint-disable vue/no-v-html -->
<template>
  <v-alert
    :type="element.alertType !== 'none' ? element.alertType : undefined"
    :title="element.title"
    :icon="element.icon?.svgPath"
    :color="element.color"
    class="my-4"
  >
    <div v-html="element._html" />
  </v-alert>
</template>

<script setup lang="ts">
import type { TexteAccentue } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => TexteAccentue, required: true }
})
</script>
