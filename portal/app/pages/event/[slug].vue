<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <!-- Error state -->
    <page-error
      v-if="pageConfigFetch.error.value"
      :status-code="pageConfigFetch.error.value.statusCode || 500"
      :title="errorTitle"
      :link="{
        type: 'standard',
        subtype: 'event-catalog',
        title: t('backToEvents')
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
const getPageImageSrc = providePageImageSrc('event', slug)

const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const eventCatalogExists = computed(() => standardPagesFetch.data.value?.['event-catalog'] || false)

const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/event/${slug}`, { watch: false })
provide('page-config', pageConfigFetch)

const errorTitle = computed(() => {
  const code = pageConfigFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('eventNotFound')
  return t('eventError')
})

watch([() => pageConfigFetch.data.value, eventCatalogExists], ([pageConfig]) => {
  const items: (LinkItem | BreadcrumbItem)[] = []
  if (eventCatalogExists.value) { items.push({ type: 'standard', subtype: 'event-catalog' }) }
  items.push({ title: pageConfig?.title || t('event') })
  setBreadcrumbs(items)
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('event')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description,
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined,
  ogType: 'article'
})

useJsonLd(() => {
  const pageConfig = pageConfigFetch.data.value
  if (!pageConfig) return []
  const base = useRequestURL()

  return createEventSchema({
    id: `${base.origin}/event/${slug}`,
    title: pageConfig.title,
    description: pageConfig.description,
    url: base.href,
    image: pageConfig.thumbnail ? getPageImageSrc(pageConfig.thumbnail) : undefined,
    startDate: pageConfig.eventMetadata?.startDate || '',
    endDate: pageConfig.eventMetadata?.endDate,
    organizer: { name: portalConfig.value.title, url: base.origin }
  })
})
</script>

<i18n lang="yaml">
  en:
    backToEvents: Go to events list
    event: Event
    eventNotFound: The requested event was not found
    eventError: An error occurred while loading the event
  fr:
    backToEvents: Aller à la liste des événements
    event: Événement
    eventNotFound: L'événement demandé n'a pas été trouvé
    eventError: Une erreur est survenue lors du chargement de l'événement
</i18n>
