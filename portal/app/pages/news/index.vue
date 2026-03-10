<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <!-- Error state -->
    <page-error
      v-if="pageConfigFetch.error.value"
      :status-code="pageConfigFetch.error.value.statusCode || 500"
    />

    <page-elements
      v-if="pageConfigFetch.data.value"
      :model-value="pageConfigFetch.data.value.elements"
    />

    <div data-iframe-height="40" />
  </layout-page>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
const getPageImageSrc = providePageImageSrc('news-catalog')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/news-catalog/news-catalog', { watch: false })
provide('page-config', pageConfigFetch)

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
  setBreadcrumbs([{ type: 'standard', subtype: 'news-catalog', title: pageConfig?.title }])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('news')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seoDescription'),
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined
})
</script>

<i18n lang="yaml">
  en:
    news: News
    emptyList: No news available
    loadError: Error while loading news
    seoDescription: 'Browse and discover the latest news. Stay informed about recent updates and announcements.'

  fr:
    news: Actualités
    emptyList: Aucune actualité disponible
    loadError: Erreur lors du chargement des actualités
    seoDescription: 'Parcourez et découvrez les dernières actualités. Restez informé des mises à jour et annonces récentes.'
</i18n>
