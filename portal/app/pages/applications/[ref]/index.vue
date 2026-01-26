<template>
  <!-- Error state -->
  <page-error
    v-if="applicationFetch.error.value"
    :status-code="applicationFetch.error.value.statusCode || 500"
    :title="errorTitle"
    :link="applicationsCatalogExists ? {
      type: 'standard',
      subtype: 'applications',
      title: t('backToApplications')
    } : undefined"
  />

  <template v-else-if="application">
    <page-element-title
      :element="{
        type: 'title',
        content: application.title,
        titleSize: 'h4',
        line: portalConfig.applications.page.titleStyle
      }"
      class="mt-0"
    />

    <v-row>
      <!-- Application image and description -->
      <v-col
        :md="portalConfig.applications.page.metadata?.location === 'right' ? 8 : 12"
        cols="12"
      >
        <img
          v-if="portalConfig.applications.page.showImage && application.image"
          :alt="application.title"
          :src="application.image"
          class="mb-4"
          style="max-height:300px"
        >
        <div
          class="text-break"
          v-html="/*eslint-disable-line vue/no-v-html*/application.description"
        />
      </v-col>

      <!-- Metadata -->
      <v-col
        :md="portalConfig.applications.page.metadata?.location === 'right' ? 4 : 12"
        :order-md="portalConfig.applications.page.metadata?.location === 'top' ? 'first' : 1"
        cols="12"
      >
        <application-metadata :application="application" />
      </v-col>
    </v-row>

    <!-- Application iframe -->
    <d-frame-wrapper
      :iframe-title="`${t('application')} - ${application.title}`"
      :src="`/data-fair/app/${$route.params.ref}?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
      class="mt-2"
      aspect-ratio
      sync-params
    />

    <!-- Datasets section -->
    <template
      v-if="portalConfig.applications.page.datasets?.display && portalConfig.applications.page.datasets?.display !== 'none' && datasets.length"
    >
      <page-element-title
        :element="{
          type: 'title',
          content: t('datasetsUsed', { count: datasets.length }),
          titleSize: 'h5',
          line: portalConfig.applications.page.titleStyle
        }"
      />

      <v-row class="d-flex align-stretch">
        <v-col
          v-for="(dataset, i) in datasetsFetch.data.value?.results"
          :key="i"
          :md="12 / (portalConfig.applications.page.datasets.columns || 3)"
          cols="12"
        >
          <dataset-card
            :dataset="dataset"
            :card-config="datasetsCardConfig"
          />
        </v-col>
      </v-row>
    </template>

    <!-- Back to applications link -->
    <v-row
      v-if="applicationsCatalogExists"
      class="my-4"
      justify="center"
    >
      <nav-link
        :link="{
          type: 'standard',
          subtype: 'applications',
          title: t('backToApplications'),
          icon: { custom: mdiChevronLeft }
        }"
        :config="portalConfig.navLinksConfig"
      />
    </v-row>
  </template>

  <div data-iframe-height="40" />
</template>

<script setup lang="ts">
import type { Application, Dataset } from '#api/types/index.ts'
import type { LinkItem } from '#api/types/portal'
import type { VBreadcrumbs } from 'vuetify/components'
import { mdiChevronLeft } from '@mdi/js'
import { withQuery } from 'ufo'

type BreadcrumbItem = NonNullable<VBreadcrumbs['$props']['items']>[number]

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()
const getPortalImageSrc = usePortalImageSrc()
const route = useRoute()

const applicationFetch = await useLocalFetch<Application>('/data-fair/api/v1/applications/' + route.params.ref, {
  params: {
    html: 'vuetify',
    publicationSites: 'data-fair-portals:' + portal.value._id
  }
})

// Check if applications catalog page exists
const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const applicationsCatalogExists = computed(() => standardPagesFetch.data.value?.applications || false)
const application = computed(() => applicationFetch.data.value)
const appConfigFetch = useLocalFetch<{ datasets: { id: string, href: string }[] }>(
  '/data-fair/api/v1/applications/' + route.params.ref + '/configuration'
)

// Datasets used by the application
const datasetsUrl = computed(() => {
  const datasetsIds = appConfigFetch.data.value?.datasets?.map(d => d.id || d.href.split('/').pop())
  if (!datasetsIds || datasetsIds.length === 0) return ''
  return withQuery('/data-fair/api/v1/datasets', {
    select: 'id,slug,title,summary,description,updatedAt,dataUpdatedAt,extras,bbox,topics,keywords,image,-userPermissions',
    size: 100,
    html: 'vuetify',
    ids: datasetsIds.join(','),
    publicationSites: 'data-fair-portals:' + portal.value._id
  })
})
const datasetsFetch = useLocalFetch<{ count: number, results: Dataset[] }>(datasetsUrl)
const datasets = computed(() => datasetsFetch.data.value?.results || [])
const datasetsCardConfig = computed(() => {
  const pageConfig = portalConfig.value.applications.page.datasets
  if (!pageConfig || pageConfig.useGlobalCard !== false) {
    return portalConfig.value.datasets.card
  }
  return { ...portalConfig.value.datasets.card, ...pageConfig.card }
})

const errorTitle = computed(() => {
  const code = applicationFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('applicationNotFound')
  return t('applicationError')
})

const thumbnailUrl = computed(() => {
  const cardConfig = portalConfig.value.applications.card
  if (!cardConfig.thumbnail?.show || !application.value) return undefined
  if (application.value.image) return application.value.image
  if (cardConfig.thumbnail.useTopic && application.value.topics?.[0]?.id) {
    const topicConfig = portalConfig.value.topics?.find((t) => t.id === application.value!.topics![0]!.id)
    if (topicConfig?.thumbnail) return getPortalImageSrc(topicConfig.thumbnail, false)
  }
  return `${application.value.href}/capture?updatedAt=${application.value.updatedAt}`
})

watch(applicationsCatalogExists, () => {
  const items: (LinkItem | BreadcrumbItem)[] = []
  if (applicationsCatalogExists.value) { items.push({ type: 'standard', subtype: 'applications' }) }
  items.push({ title: application.value?.title || t('application') })
  setBreadcrumbs(items)
}, { immediate: true })

usePageSeo({
  title: () => application.value?.title || t('application'),
  description: () => application.value?.summary,
  ogImage: () => thumbnailUrl.value,
  ogType: 'article'
})

</script>

<i18n lang="yaml">
  en:
    application: Application
    applicationNotFound: The requested application was not found
    applicationError: An error occurred while loading the application
    backToApplications: Go to applications catalog
    datasetsUsed: Dataset used | Dataset used | Datasets used
  fr:
    application: Visualisation
    applicationNotFound: La visualisation demandée n'a pas été trouvée
    applicationError: Une erreur est survenue lors du chargement de la visualisation
    backToApplications: Aller au catalogue de visualisations
    datasetsUsed: Jeu de données utilisé | Jeu de données utilisé | Jeux de données utilisés
</i18n>
