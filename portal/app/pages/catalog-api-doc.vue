<template>
  <d-frame-wrapper
    :iframe-title="`${t('apiDoc')}`"
    :src="`/openapi-viewer/?urlType=catalog`"
    class="fill-height"
    resize="no"
    sync-params
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { setBreadcrumbs } = useNavigationStore()
const { t } = useI18n()

setBreadcrumbs([
  { type: 'standard', subtype: 'datasets' },
  { title: t('apiDoc') }
])

usePageSeo({
  title: t('apiDoc'),
  description: t('apiDocDescription')
})
</script>

<i18n lang="yaml">
  en:
    dataset: Datasets
    apiDoc: Catalog API Documentation
    apiDocDescription: API documentation for developers wishing to explore or harvest the data catalog.
  fr:
    dataset: Jeux de données
    apiDoc: Documentation de l'API du catalogue
    apiDocDescription: Documentation de l'API à destination de développeurs souhaitant explorer ou moissonner le catalogue de données.
</i18n>
