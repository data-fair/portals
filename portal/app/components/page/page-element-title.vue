<template>
  <div :class="`my-${margins[element.titleSize] || '4'}`">
    <component
      :is="element.titleSize"
      :class="[
        'd-flex align-center',
        element.centered ? 'justify-center' : undefined,
        `text-${element.titleSize || 'h3'}`
      ]"
    >
      <v-divider
        v-if="element.line?.position === 'left'"
        :style="{ borderColor: `rgb(var(--v-theme-${element.line?.color}))` }"
        class="border-opacity-100 mr-4"
        thickness="4"
        vertical
      />
      <v-icon
        v-if="element.icon && (element.icon.mdi?.svgPath || element.icon.custom)"
        :icon="element.icon.mdi?.svgPath || element.icon.custom"
        :color="element.icon.color"
        size="small"
        class="mr-4"
      />
      <div :class="element.color ? `text-${element.color}` : undefined">
        {{ element.content }}
        <v-divider
          v-if="element.line?.position === 'bottom-small' || element.line?.position === 'bottom-medium'"
          :style="{ borderColor: `rgb(var(--v-theme-${element.line?.color}))` }"
          :class="[
            'border-opacity-100 mt-2',
            element.centered ? 'mx-auto' : undefined
          ]"
          :length="element.line?.position === 'bottom-small' ? '80px' : '100%'"
          thickness="4"
        />
      </div>
    </component>

    <v-divider
      v-if="element.line?.position === 'bottom-large'"
      :style="{ borderColor: `rgb(var(--v-theme-${element.line?.color}))` }"
      class="border-opacity-100 mt-2"
      thickness="4"
      length="100%"
    />
  </div>
</template>

<script setup lang="ts">
import type { TitleElement } from '#api/types/page-config'

const { element } = defineProps<{ element: TitleElement }>()

// utile pour les marges dynamiques
const margins = {
  h6: '2',
  h5: '3',
  h4: '4',
  h3: '5',
  h2: '6',
  h1: '7'
}
</script>
