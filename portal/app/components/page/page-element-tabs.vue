<!-- eslint-disable vue/no-v-html -->
<template>
  <v-card
    :border="element.border"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
  >
    <v-tabs
      v-model="activeTab"
      color="primary"
      :grow="element.grow"
      :align-tabs="element.align"
    >
      <v-tab
        v-for="(tab, i) of element.tabs"
        :key="i"
        :prepend-icon="tab.icon?.svg"
        :value="i"
      >
        {{ tab.title }}
      </v-tab>
    </v-tabs>
    <v-card-text>
      <v-tabs-window v-model="activeTab">
        <v-tabs-window-item
          v-for="(tab, i) of element.tabs.filter(t => t.children?.length)"
          :key="i"
          :value="i"
        >
          <slot
            name="page-elements"
            :on-update="(newElements: PageElement[]) => onTabsChildrenUpdate(newElements, i)"
            :elements="tab.children!"
            add-item-message="Ajouter un bloc à l'onglet"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Onglets, PageElement } from '~~/../api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => Onglets, required: true }
})

const activeTab = ref(0)

const onTabsChildrenUpdate = (newElements: PageElement[], i: number) => {
  return {
    ...element,
    tabs: [
      ...element.tabs.slice(0, i),
      { ...element.tabs[i], children: newElements },
      ...element.tabs.slice(i + 1, element.tabs.length)
    ]
  }
}

</script>
