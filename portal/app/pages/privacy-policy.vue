<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef, PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const pageConfigFetch = await useLocalFetch<PageConfig>('/portal/api/pages/privacy-policy/privacy-policy', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/privacy-policy/privacy-policy/images/${id}`
})

const title = computed(() => (pageConfigFetch.data.value?.title || t('privacyPolicy')) + ' - ' + portalConfig.value.title)
const description = computed(() => pageConfigFetch.data.value?.description || portalConfig.value.description)
useSeoMeta({
  title: title.value,
  description: description.value,
  ogTitle: title.value,
  ogDescription: description.value,
  ogType: 'website'
})
</script>

<i18n lang="yaml">
  en:
    privacyPolicy: Privacy Policy
  fr:
    privacyPolicy: Politique de confidentialité
</i18n>
