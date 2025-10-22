<template>
  <d-frame-wrapper
    :iframe-title="`${t('datasets', 0)} - ${datasetFetch.data.value?.title} - ${t('fullscreen')}`"
    :src="`/data-fair/next-ui/embed/dataset/${$route.params.ref}/table`"
    class="fill-height"
    scrolling="no"
    sync-params
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { setBreadcrumbs, clearBreadcrumbs } = useNavigationStore()
const { portal, portalConfig } = usePortalStore()
const { t } = useI18n()
const route = useRoute()

const datasetFetch = useLocalFetch<{
  title: string
  summary?: string
  description?: string
  image?: string
  thumbnail?: string
  extras?: {
    applications?: { id: string; slug: string; updatedAt: string }[]
  }
}>(`/data-fair/api/v1/datasets/${route.params.ref}`, {
  params: {
    publicationSites: 'data-fair-portals:' + portal.value._id
  }
})

const thumbnailUrl = computed(() => {
  if (datasetFetch.data.value?.image) return datasetFetch.data.value.image
  if (portalConfig.value.datasets.card.useApplicationThumbnail && datasetFetch.data.value?.extras?.applications?.[0]) {
    const { origin } = useRequestURL()
    return `${origin}/data-fair/api/v1/applications/${datasetFetch.data.value.extras.applications[0].id}/capture?updatedAt=${datasetFetch.data.value.extras.applications[0].updatedAt}`
  }
  return undefined
})

watch(datasetFetch.data, () => {
  setBreadcrumbs([
    { title: t('datasets', 1), href: '/datasets' },
    { title: datasetFetch.data.value?.title || '', href: '/datasets/' + route.params.ref },
    { title: t('fullscreen') }
  ])
}, { immediate: true })
onUnmounted(() => clearBreadcrumbs())

usePageSeo({
  title: () => datasetFetch.data.value?.title || t('datasets', 0),
  description: () => datasetFetch.data.value?.summary || datasetFetch.data.value?.description || portalConfig.value.description,
  ogImage: () => thumbnailUrl.value
})
</script>

<i18n lang="yaml">
  en:
    datasets: Dataset | Datasets
    fullscreen: Fullscreen
  fr:
    datasets: Jeu de données | Jeux de données
    fullscreen: Plein écran
</i18n>
