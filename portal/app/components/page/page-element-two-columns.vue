<!-- eslint-disable vue/no-v-html -->
<template>
  <div :class="element.mb !== 0 && `mb-${element.mb ?? 4}`">
    <v-row
      :dense="element.gutter === 'dense'"
      :no-gutters="element.gutter === 'none'"
    >
      <v-col
        :cols="12"
        :md="element.disposition === 'left' ? 8 : (element.disposition === 'right' ? 4 : 6)"
      >
        <slot
          name="page-elements"
          child-key="children"
          :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
          :elements="element.children"
          add-item-message="Ajouter un bloc à la colonne"
        />
      </v-col>
      <v-col
        :cols="12"
        :md="element.disposition === 'left' ? 4 : (element.disposition === 'right' ? 8 : 6)"
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
import type { PageElement, Colonnes } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Colonnes, required: true }
})
</script>
