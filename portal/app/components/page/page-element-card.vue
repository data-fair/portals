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
        :on-update="(newElements: PageElement[]) => ({...element, children: newElements})"
        :elements="element.children"
        add-item-message="ajouter un bloc à la boite"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn
        v-for="(action, i) in element.actions"
        :key="i"
        :href="action.href"
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
import type { PageElement, Boite } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Boite, required: true }
})
</script>
