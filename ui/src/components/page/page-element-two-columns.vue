<!-- eslint-disable vue/no-v-html -->
<template>
  <v-row
    class="mb-6"
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
        :elements="element.children"
      />
    </v-col>
    <v-col
      :cols="12"
      :md="element.disposition === 'left' ? 4 : (element.disposition === 'right' ? 8 : 6)"
    >
      <slot
        name="page-elements"
        child-key="children2"
        :elements="element.children2"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { Colonnes } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Colonnes, required: true }
})
</script>
