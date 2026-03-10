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
const getPageImageSrc = providePageImageSrc('event-catalog')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/event-catalog/event-catalog', { watch: false })
provide('page-config', pageConfigFetch)

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([{ type: 'standard', subtype: 'event-catalog', title: pageConfig?.title }])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('events')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seoDescription'),
  ogImage: () => pageConfigFetch.data.value?.thumbnail ? getPageImageSrc(pageConfigFetch.data.value.thumbnail) : undefined
})
</script>

<i18n lang="yaml">
  en:
    events: Events
    emptyList: No events available
    loadError: Error while loading events
    seoDescription: 'Browse and discover events. Find information about upcoming and past events.'

  fr:
    events: Événements
    emptyList: Aucun événement disponible
    loadError: Erreur lors du chargement des événements
    seoDescription: 'Parcourez et découvrez les événements. Trouvez des informations sur les événements à venir et passés.'
</i18n>
