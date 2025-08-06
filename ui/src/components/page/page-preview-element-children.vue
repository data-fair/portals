<template>
  <vjsf-node-comp
    v-if="child"
    :model-value="child"
    :stateful-layout="statefulLayout"
  />
</template>

<script setup lang="ts">
import type { VjsfNode, VjsfStatefulLayout } from '@koumoul/vjsf/types.js'
import VjsfNodeComp from '@koumoul/vjsf/components/node.vue'

const { childKey, node } = defineProps({
  childKey: { type: String, required: true },
  node: { type: Object as () => VjsfNode, required: true },
  statefulLayout: { type: Object as () => VjsfStatefulLayout, required: true }
})

const child = computed(() => {
  const child = node.children?.[0].children?.[0].children?.find(c => c.key === childKey) as VjsfNode
  if (!child) return child
  child.options = { ...child.options, readOnly: false, summary: false }
  console.log(child)
  return child
})
</script>
