<template>
  <page-elements
    v-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageConfig } from '#api/types/page'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/news/${slug}`, {
  watch: false
})

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/news/${slug}/images/${id}`
})

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('news')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || portalConfig.value.description,
  ogType: 'article'
})
</script>

<i18n lang="yaml">
  en:
    news: News
  fr:
    news: Actualité
</i18n>
