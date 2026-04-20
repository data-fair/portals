<template>
  <span
    v-if="resource && visible"
    class="markup-image-widget"
    :data-markup-group="group.jsonPath.join('.')"
  >
    <image-upload
      :model-value="currentImage"
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
import { findElementByPointer, type ImageUploadGroup } from '@data-fair/portals-shared-markup'
import type { StatefulLayout } from '@json-layout/core/state'

const props = defineProps<{
  elementPointer: string
  group: ImageUploadGroup
  elementsNode: any | null
  statefulLayout: StatefulLayout | null
  resource: { type: 'page', _id: string } | null
}>()

// We read/write the raw elements array via `elementsNode` (the editor's
// `props.node`) because the page-config schema delegates `/elements` to a
// custom slot, so the outer StatefulLayout never materializes children
// under `/elements` as real StateNodes we could drive directly.

const currentElement = computed(() =>
  findElementByPointer(props.elementsNode?.data, props.elementPointer)
)

const currentImage = computed(() => {
  const element = currentElement.value
  if (!element) return undefined
  let cur: any = element
  for (const seg of props.group.jsonPath) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[seg]
  }
  return cur
})

// Malformed expression falls back to visible — a broken `if` should not
// silently hide a slot the user would expect to see.
const visible = computed(() => {
  const expr = props.group.ifExpression
  if (!expr) return true
  const element = currentElement.value
  if (!element) return false
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('parent', `return (${expr})`)
    return !!fn({ data: element })
  } catch {
    return true
  }
})

const label = computed(() => props.group.label ?? props.group.jsonPath.join('.'))

function onChange (data: any) {
  if (!props.statefulLayout || !props.elementsNode) return
  const root = props.elementsNode.data
  if (!Array.isArray(root)) return
  const segments = props.elementPointer.split('/').filter(Boolean)
  if (segments.length === 0) return

  // Clone along the pointer so StatefulLayout sees fresh refs at every step.
  const nextRoot = root.slice()
  let cur: any = nextRoot
  for (const seg of segments) {
    const key: any = Array.isArray(cur) ? Number(seg) : seg
    const prev = cur[key]
    if (prev == null || typeof prev !== 'object') return
    cur[key] = Array.isArray(prev) ? prev.slice() : { ...prev }
    cur = cur[key]
  }
  const path = props.group.jsonPath
  let owner: any = cur
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i]
    owner[k] = { ...(owner[k] ?? {}) }
    owner = owner[k]
  }
  const leaf = path[path.length - 1]
  if (data == null) delete owner[leaf]
  else owner[leaf] = data

  props.statefulLayout.input(props.elementsNode, nextRoot)
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
