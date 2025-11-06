<template>
  <!-- Error state -->
  <page-error
    v-if="pageConfigFetch.error.value"
    :status-code="pageConfigFetch.error.value.statusCode || 500"
    :title="errorTitle"
    :link="{
      type: 'standard',
      subtype: 'news',
      title: t('backToNews')
    }"
  />

  <page-elements
    v-else-if="pageConfigFetch.data.value"
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

const errorTitle = computed(() => {
  const code = pageConfigFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('newsNotFound')
  return t('newsError')
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
    backToNews: Back to News List
    news: News
    newsNotFound: The requested news article was not found
    newsError: An error occurred while loading the news article
  fr:
    backToNews: Retourner à la liste des actualités
    news: Actualité
    newsNotFound: L'actualité demandée n'a pas été trouvée
    newsError: Une erreur est survenue lors du chargement de l'actualité
</i18n>
