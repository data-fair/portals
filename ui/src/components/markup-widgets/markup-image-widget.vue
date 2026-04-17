<template>
  <span
    v-if="visible && resource"
    class="markup-image-widget"
  >
    <image-upload
      :model-value="node.data"
      :label="label"
      :width="group.width"
      :height="group.height"
      :resource="resource"
      hide-details="auto"
      @update:model-value="onChange"
    />
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

// json-layout keeps every schema property as a StateNode regardless of
// visibility; the node's `layout.comp` switches between 'slot' (active) and
// 'none' (hidden by a layout.if). That's the signal we use to avoid
// rendering widgets for the inactive branch of a banner-gated image/wideImage
// pair. See tests/features/markup/stateful-layout-bridge.unit.spec.ts.
const visible = computed(() => !!node.value && (node.value as any).layout?.comp !== 'none')

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
</style>
