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
import type { ImageUploadGroup } from '@data-fair/portals-shared-markup'
import type { StatefulLayout } from '@json-layout/core/state'

const props = defineProps<{
  elementPointer: string
  group: ImageUploadGroup
  elementsNode: any | null
  statefulLayout: StatefulLayout | null
  resource: { type: 'page', _id: string } | null
}>()

// Why we don't look up a StateNode for /elements/N/image:
// the page-config schema delegates `/elements` rendering to a custom slot
// component, so the outer StatefulLayout never materializes children under
// `/elements`. We read/write the raw elements array via the `elementsNode`
// (= the editor's `props.node`) which IS a real StateNode we can call
// `statefulLayout.input` on.

/** Parse '/N' out of the element pointer '/N[/maybe/more]'. */
const elementIndex = computed(() => {
  const m = /^\/(\d+)/.exec(props.elementPointer)
  return m ? Number(m[1]) : -1
})

function getAt (obj: any, path: string[]): any {
  let cur = obj
  for (const seg of path) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[seg]
  }
  return cur
}

const currentElement = computed(() => {
  const elements = props.elementsNode?.data
  if (!Array.isArray(elements)) return undefined
  return elements[elementIndex.value]
})

const currentImage = computed(() => {
  const element = currentElement.value
  if (!element) return undefined
  return getAt(element, props.group.jsonPath)
})

/**
 * Evaluate the group's schema `layout.if` expression against the containing
 * element. The expression uses json-layout's evaluator convention —
 * `parent.data` refers to the element that owns this property. We wrap it in
 * a Function once per group.
 *
 * When no `ifExpression` is declared, the widget is always visible.
 */
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
    // Malformed expression falls back to visible — a broken if should not
    // silently hide a slot the user would expect to see.
    return true
  }
})

const label = computed(() => props.group.label ?? props.group.jsonPath.join('.'))

function onChange (data: any) {
  if (!props.statefulLayout || !props.elementsNode) return
  const current = props.elementsNode.data
  if (!Array.isArray(current)) return
  const idx = elementIndex.value
  if (idx < 0 || idx >= current.length) return

  // Clone along the mutation path so StatefulLayout observes fresh refs.
  const nextArray = current.slice()
  const nextElement: any = { ...current[idx] }
  const path = props.group.jsonPath
  let owner: any = nextElement
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    owner[key] = { ...(owner[key] ?? {}) }
    owner = owner[key]
  }
  const leaf = path[path.length - 1]
  if (data == null) delete owner[leaf]
  else owner[leaf] = data
  nextArray[idx] = nextElement

  props.statefulLayout.input(props.elementsNode, nextArray)
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
