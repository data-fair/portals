<template>
  <v-alert
    :type="element.alertType !== 'none' ? element.alertType : undefined"
    :title="element.title"
    :color="element.alertType === 'none' ? element.color : undefined"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
  >
    <template
      v-if="element.alertType === 'none' && element.icon && (element.icon.mdi?.svgPath || element.icon.custom)"
      #prepend
    >
      <v-icon
        :icon="element.icon.mdi?.svgPath || element.icon.custom"
        :color="element.icon.color"
      />
    </template>
    <template #text>
      <!--eslint-disable-next-line vue/no-v-html -->
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
