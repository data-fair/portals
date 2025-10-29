<!-- eslint-disable vue/no-v-html -->
<template>
  <div :class="element.mb !== 0 && `mb-${element.mb ?? 4}`">
    <v-row
      :dense="element.gutter === 'dense'"
      :no-gutters="element.gutter === 'none'"
      :align="isStretch ? 'stretch' : undefined"
    >
      <v-col
        :cols="12"
        :align-self="(element.align?.left && element.align.left !== 'stretch') ? element.align.left : undefined"
        :md="element.disposition === 'left' ? 8 : (element.disposition === 'right' ? 4 : 6)"
        :class="isStretch ? 'd-flex flex-column' : undefined"
      >
        <slot
          name="page-elements"
          :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
          :elements="element.children"
          add-item-message="Ajouter un bloc à la colonne"
        />
      </v-col>
      <v-col
        :cols="12"
        :align-self="(element.align?.right && element.align.right !== 'stretch') ? element.align.right : undefined"
        :md="element.disposition === 'left' ? 4 : (element.disposition === 'right' ? 8 : 6)"
        :class="isStretch ? 'd-flex flex-column' : undefined"
      >
        <slot
          name="page-elements"
          :on-update="(newElements: PageElement[]) => ({...element, children2: newElements})"
          :elements="element.children2"
          add-item-message="Ajouter un bloc à la colonne"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { PageElement, TwoColumnsElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => TwoColumnsElement, required: true }
})

const isStretch = (element.align?.left === 'stretch' || element?.align?.right === 'stretch')

</script>
