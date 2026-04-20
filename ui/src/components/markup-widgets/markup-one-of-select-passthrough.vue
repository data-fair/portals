<template>
  <template v-if="hideSelector && modelValue.children?.[0]">
    <vjsf-node
      v-for="grandChild of grandChildren"
      :key="grandChild.fullKey"
      :model-value="grandChild"
      :stateful-layout="statefulLayout"
    />
  </template>
  <original-one-of-select
    v-else
    :model-value="modelValue"
    :stateful-layout="statefulLayout"
  />
</template>

<script setup lang="ts">
// @ts-nocheck
// Drop-in replacement for VJSF's `one-of-select` node. Activated only inside the
// markup inline element form (markup-element-form-widget.vue) via that instance's
// `nodeComponents: { 'one-of-select': ... }` option. Hides the root one-of dropdown
// because the markup tag is already the source of truth for element type; nested
// one-ofs keep their selector so users can still switch between sub-types.
//
// Trigger is the per-instance `options.context.mode === 'markup-inline'` flag plus
// a "this is the root one-of" check — not a positional/parent-key heuristic.
//
// A cleaner long-term removal would be a `hideSelector` expression keyword on
// `oneOfLayout` evaluated in @json-layout/core and honored by vjsf's one-of-select
// component. Tracked as a follow-up; doing it in-tree here keeps the change local.
import { computed } from 'vue'
import { isSection } from '@json-layout/core/state'
import OriginalOneOfSelect from '@koumoul/vjsf/components/nodes/one-of-select.vue'
import VjsfNode from '@koumoul/vjsf/components/node.vue'

const props = defineProps<{
  modelValue: any
  statefulLayout: any
}>()

const isRoot = computed(() => {
  const parentKey = props.modelValue.parentFullKey
  if (parentKey == null) return false
  const parent = props.statefulLayout._lastCreateStateTreeContext?.nodesMap?.get(parentKey)
  return parent != null && parent.parentFullKey == null
})

const hideSelector = computed(() =>
  props.statefulLayout?.options?.context?.mode === 'markup-inline' && isRoot.value
)

const grandChildren = computed(() => {
  const first = props.modelValue.children?.[0]
  if (!first) return []
  return isSection(first) ? first.children : props.modelValue.children
})
</script>
