<!-- eslint-disable vue/no-v-html -->
<template>
  <v-sheet
    :class="[
      preview || !context.isRoot ? 'banner-contained' : 'banner-fluid',
      element.backgroundColor && 'bg-' + element.backgroundColor,
      !preview && element.sticky && context.isRoot && context.index === 0 && 'mt-n4',
      !preview && element.sticky && context.isRoot && context.index === context.parentLength - 1 && 'mb-n4',
      element.mb !== 0 && `mb-${element.mb ?? 4}`
    ]"
    fluid
  >
    <v-container class="container">
      <slot
        name="page-elements"
        :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
        :elements="element.children"
        add-item-message="Ajouter un bloc à la bannière"
      />
    </v-container>
  </v-sheet>
</template>

<script setup lang="ts">
import type { PageElement, BannerElement } from '#api/types/page-config'

const { element } = defineProps<{
  element: BannerElement
  context: {
    isRoot: boolean
    index: number
    parentLength: number
  }
}>()

const { preview } = usePortalStore()

</script>

<style scoped>
.banner-fluid {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

.banner-contained {
  width: 100%;
}
</style>
