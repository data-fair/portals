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
import type { PageConfig } from '#api/types/page'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('news', slug)

const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/news/${slug}`, {
  watch: false
})

const errorTitle = computed(() => {
  const code = pageConfigFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('newsNotFound')
  return t('newsError')
})

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'news' },
    { title: pageConfig?.title || t('news') }
  ])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('news')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description,
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
