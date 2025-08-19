<template>
  <v-alert
    v-if="!elements?.length"
    type="warning"
    variant="outlined"
  >
    Aucun contenu
  </v-alert>
  <page-element-comp
    v-for="(element, i) of elements"
    :key="i"
    :element="element"
  >
    <template #page-elements="{elements: childrenElements}">
      <page-elements :model-value="childrenElements" />
    </template>
  </page-element-comp>
</template>

<script setup lang="ts">
import type { PageElement } from '~~/../api/types/page-config'
import PageElementComp from './page-element.vue'

const elements = defineModel<PageElement[]>()

</script>
