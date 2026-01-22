<template>
  <div :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <LayoutBreadcrumbs is-element />
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbsElement } from '#api/types/page-elements'

const { element } = defineProps<{ element: BreadcrumbsElement }>()
</script>
