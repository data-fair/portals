<!-- eslint-disable vue/no-v-html -->
<template>
  <v-alert
    :type="element.alertType"
    :title="element.title"
    class="pb-6"
    :icon="element.icon?.svg"
  >
    <div v-html="element.content" />
  </v-alert>
</template>

<script setup lang="ts">
import type { TexteAccentue } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => TexteAccentue, required: true }
})
</script>
