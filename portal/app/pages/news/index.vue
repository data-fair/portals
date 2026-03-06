<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <div>
      <page-error
        v-if="pageConfigFetch.error.value && !missingCatalogPage"
        :status-code="pageConfigFetch.error.value.statusCode || 500"
      />

      <template v-else>
        <page-elements
          v-if="pageConfigFetch.data.value"
          :model-value="pageConfigFetch.data.value.elements"
        />

        <h1 class="text-h4 mb-6">
          {{ pageConfigFetch.data.value?.title || t('newsTitle') }}
        </h1>

        <div v-if="pending" class="text-center py-8">
          <v-progress-circular indeterminate />
        </div>

        <div v-else-if="error" class="text-error">
          {{ t('loadError') }}
        </div>

        <template v-else-if="news.data.value">
          <div v-if="news.data.value.results.length === 0" class="text-center py-8">
            {{ t('emptyList') }}
          </div>

          <div v-else class="mb-6">
            <v-row>
              <v-col
                v-for="article in news.data.value.results"
                :key="article._id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card :to="`/news/${article.config.newsMetadata?.slug}`" hover>
                  <v-card-title>{{ article.config.title }}</v-card-title>
                  <v-card-subtitle v-if="article.config.description">
                    {{ article.config.description }}
                  </v-card-subtitle>
                  <v-card-text v-if="article.updatedAt">
                    <small>{{ new Date(article.updatedAt).toLocaleDateString() }}</small>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div v-if="news.data.value.total > limit" class="d-flex justify-center mt-6">
              <v-pagination
                :model-value="currentPage"
                :length="Math.ceil(news.data.value.total / limit)"
                @update:model-value="goToPage"
              />
            </div>
          </div>
        </template>
      </template>
    </div>
  </layout-page>
</template>

<script setup lang="ts">
import type { Page, PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
const getPageImageSrc = providePageImageSrc('news-catalog')

const route = useRoute()
const router = useRouter()

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/news-catalog/news-catalog', { watch: false })
provide('page-config', pageConfigFetch)
const missingCatalogPage = computed(() => pageConfigFetch.error.value?.statusCode === 404)

const limit = 12
const currentPage = computed(() => {
  const page = parseInt(route.query.page as string)
  return isNaN(page) ? 1 : page
})

const skip = computed(() => (currentPage.value - 1) * limit)

const news = await useFetch<{
  results: Array<Pick<Page, '_id' | 'type' | 'config' | 'updatedAt'>>
  total: number
  limit: number
  skip: number
}>('/portal/api/pages/news', { query: { limit, skip }, watch: [skip] })

const { pending, error } = news

const goToPage = (page: number) => router.push({ query: { page } })

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
  setBreadcrumbs([{ type: 'standard', subtype: 'news-catalog', title: pageConfig?.title }])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('newsTitle')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seo.description'),
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined
})
</script>

<i18n lang="yaml">
  en:
    newsTitle: News
    emptyList: No news available
    loadError: Error while loading news
    seo:
      title: 'News - {title}'
      description: 'Browse and discover the latest news. Stay informed about recent updates and announcements.'

  fr:
    newsTitle: Actualités
    emptyList: Aucune actualité disponible
    loadError: Erreur lors du chargement des actualités
    seo:
      title: 'Actualités - {title}'
      description: 'Parcourez et découvrez les dernières actualités. Restez informé des mises à jour et annonces récentes.'
</i18n>
