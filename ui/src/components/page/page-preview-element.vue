<template>
  <page-element :element="renderedElement">
    <template #elements-list="{childKey}">
      <page-preview-element-children
        :node="node"
        :stateful-layout="statefulLayout"
        :child-key="childKey"
      />
    </template>
  </page-element>
</template>

<script setup lang="ts">
import type { VjsfNode, VjsfStatefulLayout } from '@koumoul/vjsf/types.js'
import { parse as marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import type { PageElement } from '#api/types/page-config'

const { node } = defineProps({
  node: { type: Object as () => VjsfNode, required: true },
  statefulLayout: { type: Object as () => VjsfStatefulLayout, required: true }
})

const renderedElement = computed(() => {
  const element = node.data as PageElement
  if (element.type === 'text') {
    return { ...element, content: sanitizeHtml(marked(element.content) as string) }
  }
  return element
})
</script>
