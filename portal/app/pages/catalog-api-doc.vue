<template>
  <d-frame-wrapper
    :iframe-title="`${t('apiDoc')}`"
    :src="`/openapi-viewer/?urlType=catalog`"
    class="fill-height"
    sync-params
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { setBreadcrumbs, clearBreadcrumbs } = useNavigationStore()
const { t } = useI18n()

setBreadcrumbs([
  { title: t('dataset'), href: '/datasets' },
  { title: t('apiDoc') }
])
onUnmounted(() => clearBreadcrumbs())

usePageSeo({
  title: () => t('apiDoc') + t('datasets'),
  description: () => t('apiDocDescription')
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
