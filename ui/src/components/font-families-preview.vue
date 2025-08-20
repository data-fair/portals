<template>
  <component
    :is="'style'"
  >
    {{ fontFamiliesCss }}
  </component>
  <v-container fluid>
    <p
      class="text-h3 mb-4"
      :style="`font-family: ${headingFontFamilyCssFetch.data ? 'preview-heading-font-family' : 'preview-body-font-family'}`"
    >
      Lorem ipsum
    </p>
    <p
      style="font-family: preview-body-font-family;"
      class="mb-4"
    >
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <v-btn
      style="font-family: preview-body-font-family;"
      color="primary"
    >
      lorem
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { PortalConfig } from '#api/types/portal'
import microTemplate from '@data-fair/lib-utils/micro-template.js'

const { portalConfig } = defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true },
})

const bodyFontFamilyCssFetch = useFetch<string>(() => portalConfig.bodyFontFamily && ($apiPath + `/assets/fonts/${portalConfig.bodyFontFamily.toLowerCase().replace(/\s/g, '')}.css`))
const headingFontFamilyCssFetch = useFetch<string>(() => portalConfig.headingFontFamily && ($apiPath + `/assets/fonts/${portalConfig.headingFontFamily.toLowerCase().replace(/\s/g, '')}.css`))

const fontFamiliesCss = computed(() => {
  let css = ''
  if (bodyFontFamilyCssFetch.data.value) {
    css += microTemplate(bodyFontFamilyCssFetch.data.value, { FONT_FAMILY: 'preview-body-font-family' })
  }
  if (headingFontFamilyCssFetch.data.value) {
    css += microTemplate(headingFontFamilyCssFetch.data.value, { FONT_FAMILY: 'preview-heading-font-family' })
  }
  return css
})
</script>
