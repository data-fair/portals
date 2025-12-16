<template>
  <component
    :is="'style'"
    :nonce="$cspNonce"
  >
    {{ fontFamiliesCss }}
  </component>
  <div
    :style="fontFamiliesVariables"
    class="ma-4"
  >
    <p
      class="text-h3 mb-4"
    >
      {{ t('titleExample') }}
    </p>
    <p
      class="text-body-1 mb-4"
    >
      {{ t('paragraphExample') }}
    </p>
    <v-btn
      class="text-body-1"
      color="primary"
    >
      {{ t('buttonExample') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { portalConfig } = usePortalStore()

const bodyFontFamily = computed(() => portalConfig.value.bodyFontFamily ?? 'Nunito')
const headingFontFamily = computed(() => portalConfig.value.headingFontFamily ?? bodyFontFamily.value ?? 'Nunito')

const bodyFontFamilyCssFetch = useFetch<string>(() => $apiPath + `/fonts/${encodeURIComponent(bodyFontFamily.value)}/css`)
const headingFontFamilyCssFetch = useFetch<string>(() => $apiPath + `/fonts/${encodeURIComponent(headingFontFamily.value)}/css`)

const fontFamiliesVariables = computed(() => {
  return `--d-body-font-family: ${bodyFontFamily.value} !important;--d-heading-font-family: ${headingFontFamily.value} !important;`
})

const fontFamiliesCss = computed(() => {
  let css = ''
  if (bodyFontFamilyCssFetch.data.value) {
    css += bodyFontFamilyCssFetch.data.value
  }
  if (headingFontFamilyCssFetch.data.value) {
    css += headingFontFamilyCssFetch.data.value
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
