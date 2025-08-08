<template>
  <vjsf-page-elements
    v-model="elements"
    :options="vjsfOptions"
  >
    <template #page-preview-element="{node, statefulLayout}">
      <page-preview-element
        :model-value="node.data"
        @update:model-value="(data: any) => statefulLayout.input(node, data)"
      />
    </template>
  </vjsf-page-elements>
</template>

<script setup lang="ts">
import { PageElement } from '#api/types/page-config'
import { type Options as VjsfOptions } from '@koumoul/vjsf'
import VjsfMarkdown from '@koumoul/vjsf-markdown'

const elements = defineModel<PageElement[]>()

const vjsfOptions: VjsfOptions = {
  titleDepth: 4,
  density: 'comfortable',
  locale: 'fr',
  updateOn: 'blur',
  initialValidation: 'always',
  plugins: [VjsfMarkdown]
}
</script>
