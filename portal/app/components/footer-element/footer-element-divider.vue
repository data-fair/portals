<template>
  <v-divider
    :thickness="element.thickness"
    :opacity="element.opacity"
    :color="element.color"
    :class="element.mb ? `mb-${element.mb}` : undefined"
  />
</template>

<script setup lang="ts">
import type { FooterDividerElement } from '#api/types/footer-elements/index.ts'

defineProps<{ element: FooterDividerElement }>()
</script>
