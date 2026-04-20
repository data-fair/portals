<template>
  <div class="markup-element-widget">
    <div class="markup-element-widget__preview">
      <markup-preview-widget
        :element-pointer="elementPointer"
        :element="element"
        :pages="pages"
      />
    </div>
    <div class="markup-element-widget__form">
      <markup-element-form-widget
        :element-pointer="elementPointer"
        :element="element"
        :elements-node="elementsNode"
        :stateful-layout="statefulLayout"
        :pages="pages"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import type { StatefulLayout } from '@json-layout/core/state'
import MarkupPreviewWidget from '~/components/markup-widgets/markup-preview-widget.vue'
import MarkupElementFormWidget from '~/components/markup-widgets/markup-element-form-widget.vue'

defineProps<{
  elementPointer: string
  element?: PageElement
  elementsNode: any | null
  statefulLayout: StatefulLayout | null
  pages?: unknown
}>()
</script>

<style scoped>
.markup-element-widget {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  margin: 4px 0;
  container-type: inline-size;
}

@container (max-width: 720px) {
  .markup-element-widget {
    grid-template-columns: 1fr;
  }
}

.markup-element-widget__preview,
.markup-element-widget__form {
  min-width: 0;
}
</style>
