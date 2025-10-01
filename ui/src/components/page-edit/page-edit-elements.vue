<template>
  <vjsf-page-elements
    v-model="elements"
    :locale="session.lang.value"
    :options="vjsfOptions"
  >
    <template #page-preview-element="{node, statefulLayout}">
      <page-preview-element
        :model-value="node.data"
        @update:model-value="(data: any) => statefulLayout.input(node, data)"
      />
    </template>
    <template #image-upload="{node, statefulLayout, width, height, label}">
      <image-upload
        :model-value="node.data"
        :label="label"
        :width="width"
        :height="height"
        :resource="pageRef"
        @update:model-value="(data: any) => {console.log('input data', data); statefulLayout.input(node, data)}"
      />
    </template>
  </vjsf-page-elements>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-config'
import { type Options as VjsfOptions } from '@koumoul/vjsf'

const elements = defineModel<PageElement[]>()
const { addItemMessage } = defineProps({ addItemMessage: { type: String, required: true } })
const session = useSession()
const pageRef = { type: 'page' as const, _id: inject('page-id') as string }

const vjsfOptions: VjsfOptions = {
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  // @ts-ignore
  messages: {
    addItem: addItemMessage
  }
}
</script>
