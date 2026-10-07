<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    v-if="element.markdown"
    :class="[...footerElementClasses(element), element.color && `text-${element.color}`]"
    style="overflow-wrap: break-word;"
    v-html="element.content_html"
  />
  <div
    v-else
    :class="[...footerElementClasses(element), element.color && `text-${element.color}`]"
    style="overflow-wrap: break-word; white-space: pre-line;"
  >
    {{ element.content }}
  </div>
</template>

<script setup lang="ts">
import type { FooterTextElement } from '#api/types/footer-elements/index.ts'

defineProps<{ element: FooterTextElement }>()
</script>
