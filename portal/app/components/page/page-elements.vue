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
  >
    <template #page-elements="{ elements: childrenElements }">
      <page-elements :model-value="childrenElements" />
    </template>
  </page-element>
</template>

<script setup lang="ts">
import type { PageElement } from '~~/../api/types/page-config'

const elements = defineModel<PageElement[]>()

const { t } = useI18n()

</script>

<i18n lang="yaml">
  en:
    noContent: 'No content'

  fr:
    noContent: 'Aucun contenu'
</i18n>
