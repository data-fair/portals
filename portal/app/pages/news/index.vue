<template>
  <layout-page>
    <div>
      <h1 class="text-h4 mb-6">Actualités</h1>

      <div v-if="pending" class="text-center py-8">
        <v-progress-circular indeterminate />
      </div>

      <div v-else-if="error" class="text-error">
        Erreur lors du chargement des actualités
      </div>

      <template v-else-if="news.data.value">
        <div v-if="news.data.value.results.length === 0" class="text-center py-8">
          Aucune actualité disponible
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

          <!-- Pagination -->
          <div v-if="news.data.value.total > limit" class="d-flex justify-center mt-6">
            <v-pagination
              :model-value="currentPage"
              :length="Math.ceil(news.data.value.total / limit)"
              @update:model-value="goToPage"
            />
          </div>
        </div>
      </template>
    </div>
  </layout-page>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const route = useRoute()
const router = useRouter()

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

setBreadcrumbs([
  { type: 'standard', subtype: 'news' }
])

usePageSeo({
  title: t('seo.title', { title: portalConfig.value.title }),
  description: t('seo.description')
})
</script>

<i18n lang="yaml">
  en:
    seo:
      title: 'News - {title}'
      description: 'Browse and discover the latest news. Stay informed about recent updates and announcements.'

  fr:
    seo:
      title: 'Actualités - {title}'
      description: 'Parcourez et découvrez les dernières actualités. Restez informé des mises à jour et annonces récentes.'
</i18n>
