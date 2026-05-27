<template>
  <component
    :is="titleTag"
    :class="[
      'd-flex align-center',
      element.centered ? 'justify-center' : undefined,
      element.bold ? 'font-weight-bold' : undefined,
      `text-${element.titleSize || 'h3'}`
    ]"
  >
    <!-- decorative <span>s instead of <v-divider>/<div> so the heading only contains phrasing content (HTML spec) -->
    <span
      v-if="element.line?.position === 'left'"
      class="d-block align-self-stretch mr-4"
      :style="{ borderLeft: `4px solid rgb(var(--v-theme-${element.line?.color}))` }"
      aria-hidden="true"
    />
    <v-icon
      v-if="element.icon && (element.icon.mdi?.svgPath || element.icon.custom)"
      :icon="element.icon.mdi?.svgPath || element.icon.custom"
      :color="element.icon.color"
      size="small"
      class="mr-4"
    />
    <span :class="['d-block', element.color ? `text-${element.color}` : undefined, element.centered ? 'text-center' : undefined]">
      {{ element.content }}
      <span
        v-if="element.line?.position === 'bottom-small' || element.line?.position === 'bottom-medium'"
        :class="['d-block mt-2', element.centered ? 'mx-auto' : undefined]"
        :style="{
          borderBottom: `4px solid rgb(var(--v-theme-${element.line?.color}))`,
          width: element.line?.position === 'bottom-small' ? '80px' : '100%'
        }"
        aria-hidden="true"
      />
    </span>
  </component>

  <v-divider
    v-if="element.line?.position === 'bottom-large'"
    :style="{ borderColor: `rgb(var(--v-theme-${element.line?.color}))` }"
    class="border-opacity-100 mt-2"
    thickness="4"
    length="100%"
  />
</template>

<script setup lang="ts">
import type { TitleElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: TitleElement }>()

const titleTag = computed(() => element.titleTag ?? element.titleSize ?? 'h3')

</script>

<style scoped>
/* Vuetify 3 MD2 text-h1 to text-h6 compatibility classes */
/* cf https://vuetifyjs.com/en/getting-started/typography-migration/#restoring-md2-typography */
.text-h1 {
  font-size: 6rem !important;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -.015625em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h2 {
  font-size: 3.75rem !important;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -.0083333333em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h3 {
  font-size: 3rem !important;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: normal !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h4 {
  font-size: 2.125rem !important;
  font-weight: 400;
  line-height: 1.175;
  letter-spacing: .0073529412em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h5 {
  font-size: 1.5rem !important;
  font-weight: 400;
  line-height: 1.333;
  letter-spacing: normal !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
.text-h6 {
  font-size: 1.25rem !important;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: .0125em !important;
  font-family: var(--d-heading-font-family);
  text-transform: none;
}
</style>
