<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <!-- Error state -->
    <page-error
      v-if="pageConfigFetch.error.value"
      :status-code="pageConfigFetch.error.value.statusCode || 500"
      :title="errorTitle"
      :link="{
        type: 'standard',
        subtype: 'news-catalog',
        title: t('backToNews')
      }"
    />

    <page-elements
      v-else-if="pageConfigFetch.data.value"
      :model-value="pageConfigFetch.data.value.elements"
    />
  </layout-page>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'
import type { LinkItem } from '#api/types/portal'
import type { VBreadcrumbs } from 'vuetify/components'

type BreadcrumbItem = NonNullable<VBreadcrumbs['$props']['items']>[number]

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
const getPageImageSrc = providePageImageSrc('news', slug)

const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const newsCatalogExists = computed(() => standardPagesFetch.data.value?.['news-catalog'] || false)

const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/news/${slug}`, { watch: false })
provide('page-config', pageConfigFetch.data)

const errorTitle = computed(() => {
  const code = pageConfigFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('newsNotFound')
  return t('newsError')
})

watch([() => pageConfigFetch.data.value, newsCatalogExists], ([pageConfig]) => {
  const items: (LinkItem | BreadcrumbItem)[] = []
  if (newsCatalogExists.value) { items.push({ type: 'standard', subtype: 'news-catalog' }) }
  items.push({ title: pageConfig?.title || t('news') })
  setBreadcrumbs(items)
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('news')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description,
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined,
  ogType: 'article'
})

useJsonLd(() => {
  const pageConfig = pageConfigFetch.data.value
  if (!pageConfig) return []
  const base = useRequestURL()

  return createNewsArticleSchema({
    id: `${base.origin}/news/${slug}`,
    title: pageConfig.title,
    description: pageConfig.description,
    url: base.href,
    image: pageConfig.thumbnail ? getPageImageSrc(pageConfig.thumbnail) : undefined,
    datePublished: pageConfig.newsMetadata?.date,
    author: { name: portalConfig.value.title, url: base.origin }
  })
})
</script>

<i18n lang="yaml">
  en:
    backToNews: Go to News List
    news: News
    newsNotFound: The requested news article was not found
    newsError: An error occurred while loading the news article
  fr:
    backToNews: Aller à la liste des actualités
    news: Actualité
    newsNotFound: L'actualité demandée n'a pas été trouvée
    newsError: Une erreur est survenue lors du chargement de l'actualité
</i18n>
