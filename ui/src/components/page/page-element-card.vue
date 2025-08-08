<!-- eslint-disable vue/no-v-html -->
<template>
  <v-card
    :border="element.border"
    :href="element.href"
    :title="element.title"
  >
    <v-card-text>
      <slot
        name="page-elements"
        child-key="children"
        :elements="element.children"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-for="(action, i) in element.actions"
        :key="i"
        :heaf="action.href"
        variant="outlined"
        :color="action.color"
      >
        <v-icon
          v-if="action.icon"
          start
        >
          {{ action.icon.svg }}
        </v-icon>
        {{ action.label }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { VCard } from 'vuetify/components'
import { Boite } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Boite, required: true }
})
</script>
