<template>
  <v-alert
    v-if="!elements?.length"
    type="warning"
    variant="outlined"
    :text="t('noContent')"
  />
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
import type { PageElement } from '~~/../api/types/page-config'

withDefaults(defineProps<{ root?: boolean }>(), {
  root: true
})

const elements = defineModel<PageElement[]>()

const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    noContent: 'No content'

  fr:
    noContent: 'Aucun contenu'
</i18n>
