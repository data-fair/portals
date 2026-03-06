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
          {{ pageConfigFetch.data.value?.title || t('eventsTitle') }}
        </h1>

        <div v-if="pending" class="text-center py-8">
          <v-progress-circular indeterminate />
        </div>

        <div v-else-if="error" class="text-error">
          {{ t('loadError') }}
        </div>

        <template v-else-if="events.data.value">
          <div v-if="events.data.value.results.length === 0" class="text-center py-8">
            {{ t('emptyList') }}
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

            <div v-if="events.data.value.total > limit" class="d-flex justify-center mt-6">
              <v-pagination
                :model-value="currentPage"
                :length="Math.ceil(events.data.value.total / limit)"
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
const getPageImageSrc = providePageImageSrc('event-catalog')

const route = useRoute()
const router = useRouter()

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/event-catalog/event-catalog', { watch: false })
provide('page-config', pageConfigFetch)
const missingCatalogPage = computed(() => pageConfigFetch.error.value?.statusCode === 404)

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
}>('/portal/api/pages/event', {
  query: {
    limit,
    skip
  },
  watch: [skip]
})

const { pending, error } = events

const goToPage = (page: number) => router.push({ query: { page } })

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
  setBreadcrumbs([{ type: 'standard', subtype: 'event-catalog', title: pageConfig?.title }])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('eventsTitle')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seo.description'),
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined
})
</script>

<i18n lang="yaml">
  en:
    eventsTitle: Events
    emptyList: No events available
    loadError: Error while loading events
    seo:
      title: 'Events - {title}'
      description: 'Browse and discover events. Find information about upcoming and past events.'

  fr:
    eventsTitle: Événements
    emptyList: Aucun événement disponible
    loadError: Erreur lors du chargement des événements
    seo:
      title: 'Événements - {title}'
      description: 'Parcourez et découvrez les événements. Trouvez des informations sur les événements à venir et passés.'
</i18n>
