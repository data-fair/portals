<template>
  <!-- Title and link -->
  <div class="d-flex align-center">
    <page-element-title
      :element="{
        type: 'title',
        content: reuseConfig.title,
        titleSize: 'h4',
        line: portalConfig.reuses.page.titleStyle
      }"
      class="my-0"
    />
    <v-spacer />
    <nav-link
      v-if="reuseConfig.link"
      :link="{
        type: 'external',
        target: true,
        href: reuseConfig.link,
        title: t('visitLink'),
        icon: { custom: mdiArrowTopRight }
      }"
      :config="portalConfig.navLinksConfig"
    />
  </div>

  <!-- Author -->
  <p
    v-if="reuseConfig.author"
    class="text-subtitle-1 mb-4"
  >
    {{ t('publishedBy', { author: reuseConfig.author }) }}
  </p>

  <!-- Description (rendered markdown) -->
  <div
    v-if="reuseConfig._descriptionHtml"
    class="markdown-content mb-6"
    v-html="/*eslint-disable-line vue/no-v-html*/reuseConfig._descriptionHtml"
  />

  <!-- Image -->
  <v-img
    v-if="portalConfig.reuses.page.showImage && reuseConfig.image"
    :src="getReuseImageSrc(reuseConfig.image, false)"
    class="mb-4"
    max-height="400"
    aria-hidden="true"
  />

  <!-- Datasets -->
  <template v-if="portalConfig.reuses.page.datasets?.display === 'card' && datasets.length">
    <page-element-title
      :element="{
        type: 'title',
        content: t('datasetsUsed', datasets.length),
        titleSize: 'h5',
        line: portalConfig.reuses.page.titleStyle
      }"
    />
    <v-row class="d-flex align-stretch">
      <v-col
        v-for="dataset in datasets"
        :key="dataset.id"
        :md="12 / (portalConfig.reuses.page.datasets?.columns || 2)"
        cols="12"
      >
        <dataset-card
          :dataset="dataset"
          :card-config="datasetCardConfig"
          is-portal-config
        />
      </v-col>
    </v-row>
  </template>

  <!-- Back to reuses link -->
  <v-row
    v-if="reusesCatalogExists"
    class="my-4"
    justify="center"
  >
    <nav-link
      :link="{
        type: 'standard',
        subtype: 'reuses',
        title: t('backToReuses'),
        icon: { custom: mdiChevronLeft }
      }"
      :config="portalConfig.navLinksConfig"
    />
  </v-row>
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { ReuseConfig } from '#api/types/reuse-config'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiChevronLeft, mdiArrowTopRight } from '@mdi/js'
import { withQuery } from 'ufo'

const { reuseConfig, slug, reusesCatalogExists } = defineProps<{
  reuseConfig: ReuseConfig
  slug: string
  reusesCatalogExists?: boolean
}>()

const { t } = useI18n()
const { portal, portalConfig, preview } = usePortalStore()

const getReuseImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/reuses/${slug}/images/${id}`
}

const datasetCardConfig = computed(() => {
  const pageConfig = portalConfig.value.reuses.page.datasets
  if (!pageConfig || pageConfig.useGlobalCard !== false) {
    return portalConfig.value.datasets.card
  }
  return { ...portalConfig.value.datasets.card, ...pageConfig.card }
})

const datasetsUrl = computed(() => {
  if (!reuseConfig?.datasets?.length) return ''
  return withQuery('/data-fair/api/v1/datasets', {
    select: 'id,slug,title,summary,description,updatedAt,dataUpdatedAt,extras,bbox,topics,keywords,image,-userPermissions',
    size: 100,
    html: 'vuetify',
    ids: reuseConfig?.datasets?.map(d => d.id).join(','),
    publicationSites: !preview ? 'data-fair-portals:' + portal.value._id : undefined
  })
})

const fetch = preview ? useFetch<{ count: number, results: Dataset[] }> : useLocalFetch<{ count: number, results: Dataset[] }>
const datasetsFetch = fetch(datasetsUrl)
const datasets = computed(() => datasetsFetch.data.value?.results || [])

</script>

<i18n lang="yaml">
  en:
    backToReuses: Back to Reuses List
    visitLink: View reuse
    publishedBy: Published by {author}
    datasetsUsed: Dataset used | Datasets used
  fr:
    backToReuses: Retourner à la liste des réutilisations
    visitLink: Voir la réutilisation
    publishedBy: Publié par {author}
    datasetsUsed: Jeu de données utilisé | Jeux de données utilisés
</i18n>
