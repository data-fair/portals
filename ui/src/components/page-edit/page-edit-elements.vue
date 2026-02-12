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
        :pages="pages"
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
    <template #color-select-item="context">
      <v-list-item v-bind="context.props">
        <template #prepend>
          <v-icon
            :icon="mdiCircle"
            :color="context.item.raw.value"
          />
        </template>
      </v-list-item>
    </template>
    <template #color-select-selection="context">
      <span :class="'v-select__selection-text'">
        <v-icon
          :icon="mdiCircle"
          :color="context.item.raw.value"
          class="mr-3"
        />{{ context.item.raw.title }}
      </span>
    </template>
  </vjsf-page-elements>
</template>

<script setup lang="ts">
import type { PageElement } from '#api/types/page-config'
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import { renderMarkdown } from '@data-fair/portals-shared-markdown'
import { mdiCircle } from '@mdi/js'

const elements = defineModel<PageElement[]>()
const { addItemMessage, pages } = defineProps<{ addItemMessage: string, pages: any, root?: boolean }>()
const session = useSessionAuthenticated()
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
  },
  context: { pages }
}
</script>

<style lang="css">
.vjsf-list-dialog .vjsf-list-dialog-toolbar .v-spacer {
  flex-grow: 0;
  width: 8px;
}
</style>
