<template>
  <slot
    v-if="preview"
    name="page-elements"
    :on-update="(newElements: PageElement[]) => ({ ...element, children: newElements })"
    :elements="element.children"
    add-item-message="Ajouter un bloc à la grille"
  />
  <v-row
    v-else
    :align="element.align === 'stretch' ? 'stretch' : undefined"
    :dense="element.gutter === 'dense'"
    :no-gutters="element.gutter === 'none'"
    :justify="element.centered ? 'center' : undefined"
    :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`]"
  >
    <v-col
      v-for="(child, i) in element.children"
      :key="i"
      :cols="colsConfig.xs"
      :sm="colsConfig.sm"
      :md="colsConfig.md"
      :lg="colsConfig.lg"
      :align-self="(element.align !== 'stretch') ? element.align : undefined"
      :class="element.align === 'stretch' ? 'd-flex flex-column' : undefined"
    >
      <slot
        name="page-elements"
        :on-update="() => {}"
        :elements="[child]"
        add-item-message="Ajouter un bloc à la grille"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { PageElement, ResponsiveGridElement } from '#api/types/page-config'

const { element } = defineProps<{ element: ResponsiveGridElement }>()
const { preview } = usePortalStore()

const colsConfig = computed(() => {
  const configs: Record<number, Record<string, number>> = {
    2: { xs: 12, sm: 12, md: 6, lg: 6 },
    3: { xs: 12, sm: 6, md: 6, lg: 4 },
    4: { xs: 12, sm: 4, md: 3, lg: 3 },
    6: { xs: 6, sm: 4, md: 3, lg: 2 }
  }
  return configs[element.columns || 2] || configs[2]!
})

</script>
