<template>
  <v-divider
    :inset="element.inset"
    :thickness="element.thickness"
    :opacity="element.opacity"
    :color="element.color"
    :class="[
      'my-4',
      element.rounded ? 'rounded' : ''
    ]"
  >
    <template v-if="element.content" #default>
      {{ element.content }}
    </template>
  </v-divider>
</template>

<script setup lang="ts">
import type { DividerElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => DividerElement, required: true }
})
</script>
