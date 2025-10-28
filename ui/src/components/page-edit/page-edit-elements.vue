<template>
  <vjsf-page-elements
    v-model="elements"
    :locale="session.lang.value"
    :options="vjsfOptions"
  >
    <template #page-preview-element="{node, statefulLayout}">
      <page-preview-element
        :model-value="node.data"
        :context="{
          isRoot: root || false,
          index: node.key,
          parentLength: elements?.length || 0
        }"
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
        hide-details="auto"
        @update:model-value="(data: any) => statefulLayout.input(node, data)"
      />
    </template>
  </vjsf-page-elements>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-config'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import { type Options as VjsfOptions } from '@koumoul/vjsf'

const elements = defineModel<PageElement[]>()
const { addItemMessage } = defineProps<{ addItemMessage: string, root?: boolean }>()
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
  },
  pluginsOptions: {
    markdown: {
      easyMDEOptions: {
        previewRender: renderMarkdown
      }
    }
  },
  icons: {
    close: '$tableGroupExpand'
  }
}
</script>

<style lang="css">
.vjsf-list-dialog .vjsf-list-dialog-toolbar .v-spacer {
  flex-grow: 0;
  width: 8px;
}
</style>
