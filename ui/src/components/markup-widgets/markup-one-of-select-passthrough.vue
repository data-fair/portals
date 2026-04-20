<template>
  <template v-if="isRoot && modelValue.children?.[0]">
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
// Drop-in replacement for VJSF's `one-of-select` node, scoped to the markup
// inline form. The markup tag already identifies the element type, so the
// root dropdown is redundant — we skip it and render the active branch's
// fields inline. Nested one-ofs (link.$oneOf, contact.additionalFields.$oneOf)
// retain the standard selector so users can still switch between sub-types.
import { computed } from 'vue'
import { isSection } from '@json-layout/core/state'
import OriginalOneOfSelect from '@koumoul/vjsf/components/nodes/one-of-select.vue'
import VjsfNode from '@koumoul/vjsf/components/node.vue'

const props = defineProps<{
  modelValue: any
  statefulLayout: any
}>()

// The root one-of node hangs directly off the top-level section (which has
// `parentFullKey === null`). Any deeper one-of has a longer parent chain.
const isRoot = computed(() => {
  const parentKey = props.modelValue.parentFullKey
  if (parentKey == null) return false
  const parent = props.statefulLayout._lastCreateStateTreeContext?.nodesMap?.get(parentKey)
  return parent != null && parent.parentFullKey == null
})

const grandChildren = computed(() => {
  const first = props.modelValue.children?.[0]
  if (!first) return []
  return isSection(first) ? first.children : props.modelValue.children
})
</script>
