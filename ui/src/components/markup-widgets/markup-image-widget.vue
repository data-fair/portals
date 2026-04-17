<template>
  <span class="markup-image-widget">
    <image-upload
      v-if="node && resource"
      :model-value="node.data"
      :label="label"
      :width="group.width"
      :height="group.height"
      :resource="resource"
      hide-details="auto"
      @update:model-value="onChange"
    />
    <span
      v-else
      class="markup-image-widget__placeholder"
    >
      {{ group.label ?? group.jsonPath.join('.') }}
    </span>
  </span>
</template>

<script setup lang="ts">
import type { ImageUploadGroup } from '@data-fair/portals-shared-markup'
import type { StatefulLayout } from '@json-layout/core/state'
import { findNodeByDataPath } from '@data-fair/portals-shared-markup/codemirror'

const props = defineProps<{
  elementPointer: string
  group: ImageUploadGroup
}>()

const statefulLayout = inject<StatefulLayout | null>('markup-stateful-layout', null)
const elementsDataPath = inject<string>('markup-elements-data-path', '')
const resource = inject<{ type: 'page', _id: string } | null>('markup-resource', null)

const targetPath = computed(() =>
  elementsDataPath + props.elementPointer + '/' + props.group.jsonPath.join('/')
)

// Re-resolve on every getter call so a StatefulLayout rebuild (new stateTree)
// is picked up on the next render. `(sl as any).stateTree` is the current
// documented shape — mirror the cast used elsewhere in this file.
const node = computed(() => {
  const treeRoot = (statefulLayout as any)?.stateTree?.root
  if (!treeRoot) return null
  return findNodeByDataPath<any>(treeRoot, targetPath.value)
})

const label = computed(() => props.group.label ?? props.group.jsonPath.join('.'))

function onChange (data: any) {
  if (!statefulLayout || !node.value) return
  statefulLayout.input(node.value, data)
}
</script>

<style scoped>
.markup-image-widget {
  display: inline-flex;
  vertical-align: middle;
  margin: 0 2px;
  max-width: 360px;
}
.markup-image-widget__placeholder {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-style: italic;
}
</style>
