<template>
  <component :is="'style'">
    {{ fontFamiliesCss }}
  </component>
  <p
    class="text-h3 mb-4"
    :style="`font-family: ${headingFontFamilyCssFetch.data ? 'preview-heading-font-family' : 'preview-body-font-family'}`"
  >
    {{ t('titleExample') }}
  </p>
  <p
    style="font-family: preview-body-font-family;"
    class="mb-4"
  >
    {{ t('paragraphExample') }}
  </p>
  <v-btn
    style="font-family: preview-body-font-family;"
    color="primary"
  >
    {{ t('buttonExample') }}
  </v-btn>
</template>

<script setup lang="ts">
import microTemplate from '@data-fair/lib-utils/micro-template.js'

const { t } = useI18n()
const { portalConfig } = usePortalStore()

const bodyFontFamilyCssFetch = useFetch<string>(() => portalConfig.value.bodyFontFamily && ($apiPath + `/assets/fonts/${portalConfig.value.bodyFontFamily.toLowerCase().replace(/\s/g, '')}.css`))
const headingFontFamilyCssFetch = useFetch<string>(() => portalConfig.value.headingFontFamily && ($apiPath + `/assets/fonts/${portalConfig.value.headingFontFamily.toLowerCase().replace(/\s/g, '')}.css`))

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

<i18n lang="yaml">
  en:
    titleExample: Title example
    paragraphExample: This is a paragraph example using the "body" font family.
    buttonExample: Button example

  fr:
    titleExample: Exemple de titre
    paragraphExample: Ceci est un exemple de paragraphe utilisant la police "body".
    buttonExample: Exemple de bouton

</i18n>
