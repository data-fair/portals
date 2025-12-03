<template>
  <div>
    <h1 class="text-h4 mb-6">
      {{ t('uses') }}
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

    <template v-else-if="uses.data.value">
      <div
        v-if="uses.data.value.results.length === 0"
        class="text-center py-8"
      >
        {{ t('noUses') }}
      </div>

      <div
        v-else
        class="mb-6"
      >
        <v-row>
          <v-col
            v-for="use in uses.data.value.results"
            :key="use._id"
            cols="12"
            md="6"
            lg="4"
          >
            <portal-use-card
              :use="use"
              :card-config="portalConfig.uses.card"
            />
          </v-col>
        </v-row>

        <!-- Pagination -->
        <div
          v-if="uses.data.value.total > limit"
          class="d-flex justify-center mt-6"
        >
          <v-pagination
            :model-value="currentPage"
            :length="Math.ceil(uses.data.value.total / limit)"
            @update:model-value="goToPage"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Use } from '#api/types/use'

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

const uses = await useFetch<{
  results: Array<Pick<Use, '_id' | 'slug' | 'config' | 'updated'>>
  total: number
  limit: number
  skip: number
  hasMore: boolean
}>('/portal/api/uses', { query: { limit, skip }, watch: [skip] })

const { pending, error } = uses

const goToPage = (page: number) => router.push({ query: { page } })

setBreadcrumbs([
  { type: 'standard', subtype: 'uses' }
])

usePageSeo({
  title: t('seo.title', { title: portalConfig.value.title }),
  description: t('seo.description')
})
</script>

<i18n lang="yaml">
  en:
    uses: Uses
    loadingError: Error loading uses
    noUses: No uses available
    seo:
      title: 'Uses - {title}'
      description: 'Browse and discover uses of our data. See how our datasets are being reused.'

  fr:
    uses: Réutilisations
    loadingError: Erreur lors du chargement des réutilisations
    noUses: Aucune réutilisation disponible
    seo:
      title: 'Réutilisations - {title}'
      description: 'Parcourez et découvrez les réutilisations de nos données. Voyez comment nos jeux de données sont réutilisés.'
</i18n>
