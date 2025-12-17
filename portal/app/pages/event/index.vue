<template>
  <div>
    <h1 class="text-h4 mb-6">Événements</h1>

    <div v-if="pending" class="text-center py-8">
      <v-progress-circular indeterminate />
    </div>

    <div v-else-if="error" class="text-error">
      Erreur lors du chargement des événements
    </div>

    <template v-else-if="events.data.value">
      <div v-if="events.data.value.results.length === 0" class="text-center py-8">
        Aucun événement disponible
      </div>

      <div v-else class="mb-6">
        <v-row>
          <v-col
            v-for="event in events.data.value.results"
            :key="event._id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card :to="`/event/${event.config.eventMetadata?.slug}`" hover>
              <v-card-title>{{ event.config.title }}</v-card-title>
              <v-card-subtitle v-if="event.config.description">
                {{ event.config.description }}
              </v-card-subtitle>
              <v-card-text v-if="event.updatedAt">
                <small>{{ new Date(event.updatedAt).toLocaleDateString() }}</small>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pagination -->
        <div v-if="events.data.value.total > limit" class="d-flex justify-center mt-6">
          <v-pagination
            :model-value="currentPage"
            :length="Math.ceil(events.data.value.total / limit)"
            @update:model-value="goToPage"
          />
        </div>
      </div>
    </template>
  </div>
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

const events = await useFetch<{
  results: Array<Pick<Page, '_id' | 'type' | 'config' | 'updatedAt'>>
  total: number
  limit: number
  skip: number
  hasMore: boolean
}>('/portal/api/pages/event', {
  query: {
    limit,
    skip
  },
  watch: [skip]
})

const { pending, error } = events

const goToPage = (page: number) => router.push({ query: { page } })

setBreadcrumbs([
  { type: 'standard', subtype: 'event' }
])

usePageSeo({
  title: t('seo.title', { title: portalConfig.value.title }),
  description: t('seo.description')
})
</script>

<i18n lang="yaml">
  en:
    seo:
      title: 'Events - {title}'
      description: 'Browse and discover events. Find information about upcoming and past events.'

  fr:
    seo:
      title: 'Événements - {title}'
      description: 'Parcourez et découvrez les événements. Trouvez des informations sur les événements à venir et passés.'
</i18n>
