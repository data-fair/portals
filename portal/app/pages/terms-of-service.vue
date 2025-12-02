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
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const pageConfigFetch = await useLocalFetch<PageConfig>('/portal/api/pages/terms-of-service/terms-of-service', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/terms-of-service/terms-of-service/images/${id}`
})

watch(() => pageConfigFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'terms-of-service', title: pageConfigFetch.data.value?.title }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('termsOfService')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || portalConfig.value.description
})
</script>

<i18n lang="yaml">
  en:
    termsOfService: Terms of Service
  fr:
    termsOfService: Conditions générales d'utilisation
</i18n>
