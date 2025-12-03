<template>
  <div>
    <h1 class="text-h4 mb-6">
      {{ t('reuses') }}
    </h1>

    <div
      v-if="pending"
      class="text-center py-8"
    >
      <v-progress-circular indeterminate />
    </div>

    <div
      v-else-if="error"
      class="text-error"
    >
      {{ t('loadingError') }}
    </div>

    <template v-else-if="reuses.data.value">
      <div
        v-if="reuses.data.value.results.length === 0"
        class="text-center py-8"
      >
        {{ t('noReuses') }}
      </div>

      <div
        v-else
        class="mb-6"
      >
        <v-row>
          <v-col
            v-for="reuse in reuses.data.value.results"
            :key="reuse._id"
            cols="12"
            md="6"
            lg="4"
          >
            <portal-reuse-card
              :reuse="reuse"
              :card-config="portalConfig.reuses.card"
            />
          </v-col>
        </v-row>

        <!-- Pagination -->
        <div
          v-if="reuses.data.value.total > limit"
          class="d-flex justify-center mt-6"
        >
          <v-pagination
            :model-value="currentPage"
            :length="Math.ceil(reuses.data.value.total / limit)"
            @update:model-value="goToPage"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse'

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

const reuses = await useFetch<{
  results: Array<Pick<Reuse, '_id' | 'slug' | 'config' | 'updated'>>
  total: number
  limit: number
  skip: number
  hasMore: boolean
}>('/portal/api/reuses', { query: { limit, skip }, watch: [skip] })

const { pending, error } = reuses

const goToPage = (page: number) => router.push({ query: { page } })

setBreadcrumbs([
  { type: 'standard', subtype: 'reuses' }
])

usePageSeo({
  title: t('seo.title', { title: portalConfig.value.title }),
  description: t('seo.description')
})
</script>

<i18n lang="yaml">
  en:
    reuses: Reuses
    loadingError: Error loading reuses
    noReuses: No reuses available
    seo:
      title: 'Reuses - {title}'
      description: 'Browse and discover reuses of our data. See how our datasets are being reused.'

  fr:
    reuses: Réutilisations
    loadingError: Erreur lors du chargement des réutilisations
    noReuses: Aucune réutilisation disponible
    seo:
      title: 'Réutilisations - {title}'
      description: 'Parcourez et découvrez les réutilisations de nos données. Voyez comment nos jeux de données sont réutilisés.'
</i18n>
