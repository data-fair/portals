<!-- eslint-disable vue/no-v-html -->
<template>
  <v-card>
    <v-card-text>
      <slot
        name="page-elements"
        child-key="children"
        :elements="element.children"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Boite } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Boite, required: true }
})
</script>
