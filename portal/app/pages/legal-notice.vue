<template>
  <tracking-consent v-if="privacyPolicyCheck.error.value && cookiePolicyCheck.error.value" />

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

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/legal-notice/legal-notice', { watch: false })
const privacyPolicyCheck = await useFetch<PageConfig>('/portal/api/pages/privacy-policy/privacy-policy', { watch: false })
const cookiePolicyCheck = await useFetch<PageConfig>('/portal/api/pages/cookie-policy/cookie-policy', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/legal-notice/legal-notice/images/${id}`
})

watch(() => pageConfigFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'legal-notice', title: pageConfigFetch.data.value?.title }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('legalNotice')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || portalConfig.value.description
})
</script>

<i18n lang="yaml">
  en:
    legalNotice: Legal Notice
  fr:
    legalNotice: Mentions légales
</i18n>
