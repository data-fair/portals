<template>
  <d-frame-wrapper
    :iframe-title="`${t('dataset')} - ${datasetFetch.data.value?.title} - ${t('fullscreen')}`"
    :src="`/data-fair/embed/dataset/${$route.params.ref}/table`"
    class="fill-height"
    resize="no"
    scrolling="no"
    sync-params
  />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'

definePageMeta({ layout: 'full' })

const { setBreadcrumbs } = useNavigationStore()
const { portal, portalConfig } = usePortalStore()
const { t } = useI18n()
const route = useRoute()
const { origin } = useRequestURL()

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

const getImageSrc: ((imageRef: ImageRef, mobile: boolean) => string) = inject('get-image-src')!

const thumbnailUrl = computed(() => {
  const cardConfig = portalConfig.value.datasets.card
  const dataset = datasetFetch.data.value
  if (!dataset || !cardConfig.thumbnail?.show) return undefined
  if (dataset.image) return dataset.image
  if (cardConfig.thumbnail.useApplication && dataset.extras?.applications?.[0]) {
    return `${origin}/data-fair/api/v1/applications/${dataset.extras.applications[0].id}/capture?updatedAt=${dataset.extras.applications[0].updatedAt}`
  }
  if (cardConfig.thumbnail?.default) return origin + getImageSrc(cardConfig.thumbnail.default, false)
  return undefined
})

watch(datasetFetch.data, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'datasets' },
    { title: datasetFetch.data.value?.title || t('dataset'), to: '/datasets/' + route.params.ref },
    { title: t('fullscreen') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => datasetFetch.data.value?.title || t('dataset'),
  description: () => datasetFetch.data.value?.summary || datasetFetch.data.value?.description || portalConfig.value.description,
  ogImage: () => thumbnailUrl.value
})
</script>

<i18n lang="yaml">
  en:
    dataset: Dataset
    fullscreen: Fullscreen
  fr:
    dataset: Jeu de données
    fullscreen: Plein écran
</i18n>
