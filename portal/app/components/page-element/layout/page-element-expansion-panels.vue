<template>
  <v-expansion-panels
    v-model="activePanels"
    :multiple="element.multiple"
    :rounded="element.rounded"
    :elevation="element.elevation"
    :color="element.titleBackgroundColor ?? 'surface'"
    :bg-color="element.textBackgroundColor"

    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    variant="accordion"
    static
  >
    <template
      v-for="(panel, i) of element.panels.filter(Boolean)"
      :key="i"
    >
      <v-expansion-panel>
        <template #title>
          <span class="d-flex align-center">
            <v-icon
              v-if="panel.icon && (panel.icon.mdi?.svgPath || panel.icon.custom)"
              :icon="panel.icon.mdi?.svgPath || panel.icon.custom"
              :color="panel.icon.color"
              class="mr-2"
            />
            {{ panel.title }}
          </span>
        </template>
        <template #text>
          <slot
            name="page-elements"
            :on-update="(newElements: PageElement[]) => onPanelsChildrenUpdate(newElements, i)"
            :elements="panel.children"
            add-item-message="Ajouter un bloc au panneau"
          />
        </template>
      </v-expansion-panel>
    </template>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import type { ExpansionPanelsElement, PageElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => ExpansionPanelsElement, required: true }
})

const activePanels = ref<number[] | number | null>(element.multiple ? [] : null)

const count = element.panels.filter(Boolean).length
if (element.openFirst) activePanels.value = element.multiple ? [0] : 0
if (element.openAll) activePanels.value = element.multiple ? Array.from({ length: count }, (_, i) => i) : 0

const onPanelsChildrenUpdate = (newElements: PageElement[], i: number) => {
  return {
    ...element,
    panels: [
      ...element.panels.slice(0, i),
      { ...element.panels[i], children: newElements },
      ...element.panels.slice(i + 1, element.panels.length)
    ]
  }
}

</script>
