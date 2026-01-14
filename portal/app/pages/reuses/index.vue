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

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/reuses/reuses', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/reuses/reuses/images/${id}`
})

watch(() => pageConfigFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'reuses', title: pageConfigFetch.data.value?.title }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('reuses')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seoDescription')
})
</script>

<i18n lang="yaml">
  en:
    reuses: Reuses
    seoDescription: 'Browse and discover how our datasets are reused.'
  fr:
    reuses: Réutilisations
    seoDescription: 'Parcourez et découvrez les réutilisations de nos données.'
</i18n>
