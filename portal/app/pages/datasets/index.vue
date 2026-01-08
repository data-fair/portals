<template>
  <!-- Error state -->
  <page-error
    v-if="pageConfigFetch.error.value"
    :status-code="pageConfigFetch.error.value.statusCode || 500"
  />

  <page-elements
    v-else-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />

  <div data-iframe-height="40" />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/datasets/datasets', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/datasets/datasets/images/${id}`
})

watch(() => pageConfigFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'datasets', title: pageConfigFetch.data.value?.title }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('datasets')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seoDescription')
})

useJsonLd(() => createDataCatalogSchema({
  id: `${useRequestURL().origin}/datasets`,
  title: pageConfigFetch.data.value?.title || t('datasets'),
  description: pageConfigFetch.data.value?.description || t('seoDescription'),
  url: useRequestURL().href,
  creator: {
    name: portalConfig.value.title
  },
  datePublished: new Date().toISOString()
}))

</script>

<i18n lang="yaml">
  en:
    datasets: Datasets
    seoDescription: 'Explore our datasets. Find data by themes, concepts, and more.'
  fr:
    datasets: Données
    seoDescription: 'Explorez nos jeux de données. Trouvez des données par thèmes, concepts, et plus encore.'
</i18n>
