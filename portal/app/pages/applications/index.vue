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

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/applications/applications', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/applications/applications/images/${id}`
})

watch(() => pageConfigFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'applications', title: pageConfigFetch.data.value?.title }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('applications')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seoDescription')
})

</script>

<i18n lang="yaml">
  en:
    applications: Applications
    seoDescription: 'Explore our applications: interactive maps, charts, and tables to analyze and understand data.'
  fr:
    applications: Visualisations
    seoDescription: 'Explorez nos visualisations : cartes interactives, graphiques et tableaux pour analyser et comprendre les données.'
</i18n>
