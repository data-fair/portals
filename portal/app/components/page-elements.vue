<template>
  <page-element
    v-for="(element, i) of elements"
    :key="i"
    :element="element"
    :context="{
      isRoot: root,
      index: i,
      parentLength: elements?.length || 0
    }"
  >
    <template #page-elements="{ elements: childrenElements }">
      <page-elements
        :model-value="childrenElements"
        :root="false"
      />
    </template>
  </page-element>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-elements/index.ts'
import { usePageParamsTools } from '../composables/agent/page-params-tools'

const props = withDefaults(defineProps<{ root?: boolean }>(), {
  root: true
})

const elements = defineModel<PageElement[]>()

// Register the page-scoped filter tools once, at the page root. They live on the
// WebMCP channel for as long as this page is mounted, shared by the global agent
// and any custom-agent block on the page.
const { locale } = useI18n()
if (props.root) usePageParamsTools(toRef(() => locale.value))

</script>
