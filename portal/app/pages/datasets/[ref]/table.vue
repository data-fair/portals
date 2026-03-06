<template>
  <d-frame-wrapper
    :iframe-title="`${t('dataset')} - ${datasetFetch.data.value?.title} - ${t('table')}`"
    :src="`/data-fair/embed/dataset/${$route.params.ref}/table`"
    class="fill-height"
    resize="no"
    scrolling="no"
    sync-params
    emit-iframe-messages
    @iframe-message="(iframeMessage: CustomEvent) => onIframeTrackMessage(iframeMessage.detail)"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { t } = useI18n()
const route = useRoute()
const { origin } = useRequestURL()
const { setBreadcrumbs } = useNavigationStore()
const { portal, portalConfig } = usePortalStore()
const getPortalImageSrc = usePortalImageSrc()

const datasetFetch = useLocalFetch<{
  title: string
  summary?: string
  description?: string
  image?: string
  thumbnail?: string
  topics: { id: string; title: string; color: string }[]
  extras?: {
    applications?: { id: string; slug: string; updatedAt: string }[]
  }
}>(`/data-fair/api/v1/datasets/${route.params.ref}`, {
  params: {
    publicationSites: 'data-fair-portals:' + portal.value._id
  }
})

const thumbnailUrl = computed(() => {
  const cardConfig = portalConfig.value.datasets.card
  const dataset = datasetFetch.data.value
  if (!dataset || !cardConfig.thumbnail?.show) return undefined
  if (dataset.image) return dataset.image
  if (cardConfig.thumbnail.useTopic && dataset.topics?.[0]?.id) {
    const topicConfig = portalConfig.value.topics?.find((t) => t.id === dataset.topics[0]!.id)
    if (topicConfig?.thumbnail) return getPortalImageSrc(topicConfig.thumbnail, false)
  }
  if (cardConfig.thumbnail.useApplication && dataset.extras?.applications?.[0]) {
    return `${origin}/data-fair/api/v1/applications/${dataset.extras.applications[0].id}/capture?updatedAt=${dataset.extras.applications[0].updatedAt}`
  }
  if (cardConfig.thumbnail?.default) return getPortalImageSrc(cardConfig.thumbnail.default, false)
  return undefined
})

watch(datasetFetch.data, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'datasets' },
    { title: datasetFetch.data.value?.title || t('dataset'), to: '/datasets/' + route.params.ref },
    { title: t('table') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => datasetFetch.data.value?.title || t('dataset'),
  description: () => datasetFetch.data.value?.summary,
  ogImage: () => thumbnailUrl.value
})

onMounted(() => window.parent.postMessage(['df-child', 'reinit-height'], '*'))
</script>

<i18n lang="yaml">
  en:
    dataset: Dataset
    table: Table
  fr:
    dataset: Jeu de données
    table: Tableau
</i18n>
