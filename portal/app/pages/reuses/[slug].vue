<template>
  <!-- Error state -->
  <page-error
    v-if="reuseFetch.error.value"
    :status-code="reuseFetch.error.value.statusCode || 500"
    :title="errorTitle"
    :link="{
      type: 'standard',
      subtype: 'reuses',
      title: t('backToReuses')
    }"
  />

  <template v-else-if="reuseConfig">
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
      :src="getImageSrc(reuseConfig.image, false)"
      :alt="reuseConfig.title"
      class="mb-4"
      max-height="400"
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
          />
        </v-col>
      </v-row>
    </template>

    <!-- Back to reuses link -->
    <v-row
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
</template>

<script setup lang="ts">
import type { Dataset } from '#api/types/index.ts'
import type { Reuse } from '#api/types/reuse'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiChevronLeft, mdiArrowTopRight } from '@mdi/js'
import { withQuery } from 'ufo'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

const reuseFetch = await useFetch<Pick<Reuse, '_id' | 'slug' | 'config'>>(`/portal/api/reuses/${slug}`, {
  watch: false
})
const reuseConfig = computed(() => reuseFetch.data.value?.config)

const datasetCardConfig = computed(() => {
  const pageConfig = portalConfig.value.reuses.page.datasets
  if (!pageConfig || pageConfig.useGlobalCard !== false) {
    return portalConfig.value.datasets.card
  }
  return { ...portalConfig.value.datasets.card, ...pageConfig.card }
})

const datasetsUrl = computed(() => {
  if (!reuseConfig.value?.datasets?.length) return ''
  return withQuery('/data-fair/api/v1/datasets', {
    select: 'id,slug,title,description,updatedAt,dataUpdatedAt,extras,bbox,topics,keywords,image,-userPermissions',
    size: 100,
    html: 'vuetify',
    ids: reuseConfig.value?.datasets?.map(d => d.id).join(','),
    publicationSites: 'data-fair-portals:' + portal.value._id
  })
})

const datasetsFetch = useLocalFetch<{ count: number, results: Dataset[] }>(datasetsUrl)
const datasets = computed(() => datasetsFetch.data.value?.results || [])

const errorTitle = computed(() => {
  const code = reuseFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('reuseNotFound')
  return t('reuseError')
})

const getImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/reuses/${slug}/images/${id}`
}

watch(() => reuseFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'reuses' },
    { title: reuseConfig.value?.title || t('reuse') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => (reuseConfig.value?.title || t('reuse')) + ' - ' + portalConfig.value.title,
  description: () => reuseConfig.value?.summary || portalConfig.value.description,
  ogType: 'article'
})
</script>

<i18n lang="yaml">
  en:
    backToReuses: Back to Reuses List
    reuse: Reuse
    reuseNotFound: The requested reuse was not found
    reuseError: An error occurred while loading the reuse
    visitLink: View reuse
    publishedBy: Published by {author}
    datasetsUsed: Dataset used | Datasets used
  fr:
    backToReuses: Retourner à la liste des réutilisations
    reuse: Réutilisation
    reuseNotFound: La réutilisation demandée n'a pas été trouvée
    reuseError: Une erreur est survenue lors du chargement de la réutilisation
    visitLink: Voir la réutilisation
    publishedBy: Publié par {author}
    datasetsUsed: Jeu de données utilisé | Jeux de données utilisés
</i18n>
