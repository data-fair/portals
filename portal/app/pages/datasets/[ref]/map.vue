<template>
  <h1 class="d-sr-only">
    {{ `${datasetFetch.data.value?.title || t('dataset')} - ${t('map')}` }}
  </h1>

  <!-- a dataset without geographic data has no map: the embed would show an empty map and
       a raw error (no portal link leads here, but a typed URL or the assistant can) -->
  <v-container v-if="datasetFetch.data.value && !datasetFetch.data.value.bbox?.length">
    <v-alert
      type="info"
      variant="tonal"
      :text="t('noGeoData')"
    />
    <v-btn
      class="mt-4"
      color="primary"
      variant="flat"
      :to="`/datasets/${$route.params.ref}/table`"
    >
      {{ t('seeTable') }}
    </v-btn>
  </v-container>
  <d-frame-wrapper
    v-else
    :iframe-title="`${t('dataset')} - ${datasetFetch.data.value?.title} - ${t('map')}`"
    :src="`/data-fair/embed/dataset/${$route.params.ref}/map`"
    class="fill-height"
    resize="no"
    scrolling="no"
    sync-params
  />
</template>

<script setup lang="ts">
import type { LinkItem } from '#api/types/portal'
import type { VBreadcrumbs } from 'vuetify/components'

type BreadcrumbItem = NonNullable<VBreadcrumbs['$props']['items']>[number]

definePageMeta({ layout: 'full' })

const { t } = useI18n()
const route = useRoute()
const { origin } = useRequestURL()
const { setBreadcrumbs } = useNavigationStore()
const { portalConfig } = usePortalStore()
const getPortalImageSrc = usePortalImageSrc()

const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const datasetsCatalogExists = computed(() => standardPagesFetch.data.value?.datasets || false)

const datasetFetch = await useLocalFetch<{
  title: string
  summary?: string
  description?: string
  image?: string
  thumbnail?: string
  updatedAt?: string
  bbox?: number[]
  topics: { id: string; title: string; color: string }[]
  extras?: {
    applications?: { id: string; slug: string; updatedAt: string }[]
  }
}>(`/data-fair/api/v1/datasets/${route.params.ref}`)

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

watch([datasetFetch.data, datasetsCatalogExists], () => {
  const items: (LinkItem | BreadcrumbItem)[] = []
  if (datasetsCatalogExists.value) { items.push({ type: 'standard', subtype: 'datasets' }) }
  items.push({ title: datasetFetch.data.value?.title || t('dataset'), to: '/datasets/' + route.params.ref })
  items.push({ title: t('map') })
  setBreadcrumbs(items)
}, { immediate: true })

usePageSeo({
  title: () => datasetFetch.data.value?.title || t('dataset'),
  description: () => datasetFetch.data.value?.summary,
  ogImage: () => thumbnailUrl.value,
  noindex: true
})

onMounted(() => window.parent.postMessage(['df-child', 'reinit-height'], '*'))
</script>

<i18n lang="yaml">
  en:
    dataset: Dataset
    map: Map
    noGeoData: This dataset has no geographic data, it cannot be shown on a map.
    seeTable: See the table
  fr:
    dataset: Jeu de données
    map: Carte
    noGeoData: Ce jeu de données ne contient pas de données géographiques, il ne peut pas être affiché sur une carte.
    seeTable: Voir le tableau
</i18n>
