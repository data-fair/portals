<template>
  <!-- Error state -->
  <page-error
    v-if="pageConfigFetch.error.value"
    :status-code="pageConfigFetch.error.value.statusCode || 500"
    :title="errorTitle"
    :link="{
      type: 'standard',
      subtype: 'event',
      title: t('backToEvents')
    }"
  />

  <page-elements
    v-else-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageConfig } from '#api/types/page'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const pageConfigFetch = await useFetch<PageConfig>(`/portal/api/pages/event/${slug}`, {
  watch: false
})

const errorTitle = computed(() => {
  const code = pageConfigFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('eventNotFound')
  return t('eventError')
})

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/event/${slug}/images/${id}`
})

watch(() => pageConfigFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'event' },
    { title: pageConfigFetch.data.value?.title || t('event') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('event')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || portalConfig.value.description,
  ogType: 'article'
})
</script>

<i18n lang="yaml">
  en:
    backToEvents: Back to Events List
    event: Event
    eventNotFound: The requested event was not found
    eventError: An error occurred while loading the event
  fr:
    backToEvents: Retourner à la liste des événements
    event: Événement
    eventNotFound: L'événement demandé n'a pas été trouvé
    eventError: Une erreur est survenue lors du chargement de l'événement
</i18n>
