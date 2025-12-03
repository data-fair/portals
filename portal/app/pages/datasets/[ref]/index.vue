<template>
  <!-- Error state -->
  <page-error
    v-if="datasetFetch.error.value"
    :status-code="datasetFetch.error.value.statusCode || 500"
    :title="errorTitle"
    :link="{
      type: 'standard',
      subtype: 'datasets',
      title: t('backToDatasets')
    }"
  />

  <template v-else-if="dataset">
    <page-element-title
      :element="{
        type: 'title',
        content: dataset.title,
        titleSize: 'h4',
        line: portalConfig.datasets.page.titleStyle
      }"
      class="mt-0"
    />

    <v-row>
      <!-- Dataset image and description -->
      <v-col
        :md="portalConfig.datasets.page.metadata?.location === 'right' ? 8 : 12"
        cols="12"
      >
        <img
          v-if="portalConfig.datasets.page.showImage && dataset.image"
          :alt="dataset.title"
          :src="dataset.image"
          class="mb-4"
          style="max-height:300px"
        >
        <div v-html="/*eslint-disable-line vue/no-v-html*/dataset.description" />
      </v-col>

      <!-- Metadata -->
      <v-col
        :md="portalConfig.datasets.page.metadata?.location === 'right' ? 4 : 12"
        :order-md="portalConfig.datasets.page.metadata?.location === 'top' ? 'first' : 1"
        cols="12"
      >
        <dataset-metadata :dataset="dataset" />
      </v-col>
    </v-row>

    <!-- Data section with tabs -->
    <template v-if="portalConfig.datasets.page.showData && !dataset.isMetaOnly">
        <page-element-title
          :element="{
            type: 'title',
            content: t('sections.data'),
            titleSize: 'h5',
            line: portalConfig.datasets.page.titleStyle
          }"
        />

        <v-tabs
          v-model="dataTab"
          class="mb-4"
        >
          <v-tab value="table">
            {{ t('sections.table') }}
          </v-tab>
          <v-tab
            v-if="dataset.bbox?.length"
            value="map"
          >
            {{ t('sections.map') }}
          </v-tab>
          <v-tab value="schema">
            {{ t('sections.schema') }}
          </v-tab>
        </v-tabs>

        <v-tabs-window
          v-model="dataTab"
          class="mb-8"
        >
          <v-tabs-window-item value="table">
            <d-frame-wrapper
              :iframe-title="`${t('sections.table')} - ${dataset.title}`"
              :src="`/data-fair/embed/dataset/${dataset.id}/table`"
              scrolling="no"
              resize="no"
              aspect-ratio
            />
          </v-tabs-window-item>

          <v-tabs-window-item
            v-if="dataset.bbox?.length"
            value="map"
          >
            <d-frame-wrapper
              :iframe-title="`${t('sections.map')} - ${dataset.title}`"
              :src="`/data-fair/embed/dataset/${dataset.id}/map`"
              scrolling="no"
              resize="no"
              aspect-ratio
            />
          </v-tabs-window-item>

          <v-tabs-window-item value="schema">
            <d-frame-wrapper
              :iframe-title="`${t('sections.schema')} - ${dataset.title}`"
              :src="`/data-fair/embed/dataset/${dataset.id}/fields`"
              resize="no"
              aspect-ratio
            />
          </v-tabs-window-item>
        </v-tabs-window>
    </template>

    <!-- Applications section -->
    <template v-if="portalConfig.datasets.page.applications?.display && portalConfig.datasets.page.applications?.display !== 'none' && orderedApplications.length">
      <page-element-title
        :element="{
          type: 'title',
          content: t('sections.application', { count: orderedApplications.length }),
          titleSize: 'h5',
          line: portalConfig.datasets.page.titleStyle
        }"
      />

      <!-- Card display mode -->
      <v-row
        v-if="portalConfig.datasets.page.applications?.display === 'card'"
        class="d-flex align-stretch"
      >
        <v-col
          v-for="app in orderedApplications"
          :key="app.id"
          :md="12 / (portalConfig.datasets.page.applications.columns || 2)"
          cols="12"
        >
          <application-card
            :application="app"
            :card-config="applicationCardConfig"
          />
        </v-col>
      </v-row>

      <!-- Full list display mode -->
      <template v-else-if="portalConfig.datasets.page.applications?.display === 'full-list'">
        <v-row
          v-for="app in orderedApplications"
          :key="app.id"
          align="center"
        >
          <v-col cols="12">
            <NuxtLink
              class="simple-link"
              :to="`/applications/${app.slug}`"
            >
              {{ app.title }}
              <v-icon
                :icon="mdiOpenInNew"
                color="primary"
              />
            </NuxtLink>
          </v-col>
          <v-col cols="12">
            <d-frame-wrapper
              :iframe-title="`${t('application')} - ${app.title}`"
              :src="app.exposedUrl + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
              resize="no"
              aspect-ratio
            />
          </v-col>
        </v-row>
      </template>

      <!-- Side by side display mode (default) -->
      <template v-else>
        <v-row
          v-for="(app, index) in orderedApplications"
          :key="app.id"
          align="center"
          class="mb-4"
        >
          <!-- Large display: title, description and visualization full width -->
          <template v-if="app.preferLargeDisplay">
            <v-col cols="12">
              <NuxtLink
                class="simple-link"
                :to="`/applications/${app.slug}`"
              >
                {{ app.title }}
                <v-icon
                  :icon="mdiOpenInNew"
                  color="primary"
                />
              </NuxtLink>
              <div
                class="mt-2"
                v-html="/*eslint-disable-line vue/no-v-html*/app.description"
              />
            </v-col>
            <v-col cols="12">
              <d-frame-wrapper
                :iframe-title="`${t('application')} - ${app.title}`"
                :src="app.exposedUrl + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
                resize="no"
                aspect-ratio
              />
            </v-col>
          </template>

          <!-- Side by side: alternate left/right -->
          <template v-else>
            <v-col
              :md="6"
              cols="12"
              :order-md="index % 2 === 0 ? 'first' : 1"
            >
              <d-frame-wrapper
                :iframe-title="`${t('application')} - ${app.title}`"
                :src="app.exposedUrl + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
                resize="no"
                aspect-ratio
              />
            </v-col>
            <v-col
              :md="6"
              cols="12"
            >
              <NuxtLink
                class="simple-link"
                :to="`/applications/${app.slug}`"
              >
                {{ app.title }}
                <v-icon
                  :icon="mdiOpenInNew"
                  color="primary"
                />
              </NuxtLink>
              <div
                class="mt-2"
                v-html="/*eslint-disable-line vue/no-v-html*/app.description"
              />
            </v-col>
          </template>
        </v-row>
      </template>
    </template>

    <!-- Uses section -->
    <template v-if="portalConfig.datasets.page.uses?.display && portalConfig.datasets.page.uses?.display !== 'none' && datasetUses.length">
      <page-element-title
        :element="{
          type: 'title',
          content: t('sections.use', { count: datasetUses.length }),
          titleSize: 'h5',
          line: portalConfig.datasets.page.titleStyle
        }"
      />

      <v-row class="d-flex align-stretch">
        <v-col
          v-for="use in datasetUses"
          :key="use._id"
          :md="12 / (portalConfig.datasets.page.uses.columns || 3)"
          cols="12"
        >
          <use-card
            :use="use"
            :card-config="usesCardConfig"
          />
        </v-col>
      </v-row>
    </template>

    <!-- Back to datasets link -->
    <v-row
      class="my-4"
      justify="center"
    >
      <nav-link
        :link="{
          type: 'standard',
          subtype: 'datasets',
          title: t('backToDatasets'),
          icon: { custom: mdiChevronLeft }
        }"
        :config="portalConfig.navLinksConfig"
      />
    </v-row>
  </template>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import { mdiOpenInNew, mdiChevronLeft } from '@mdi/js'
import { withQuery } from 'ufo'

type Application = {
  id: string
  slug: string
  title: string
  summary?: string
  description: string
  updatedAt: string
  exposedUrl: string
  url: string
  href: string
  preferLargeDisplay: boolean
  owner: Account
  topics: { id: string; title: string; color: string }[]
}

type Dataset = {
  id: string
  slug: string
  title: string
  summary?: string
  description?: string
  dataUpdatedAt: string
  updatedAt: string
  owner: Account
  count?: number
  storage?: {
    indexed?: {
      size?: number
    }
  }
  origin?: string
  license?: {
    title: string
    href: string
  }
  keywords?: string[]
  spatial?: string
  temporal?: {
    start: string
    end?: string
  }
  frequency?: string
  attachments: {
    url: string
    title: string
    name: string
    type: 'file' | 'remoteFile'
    description: string
    size: string
    updatedAt: string
  }[]
  image?: string
  thumbnail?: string
  isMetaOnly: boolean
  isRest: boolean
  isVirtual: boolean
  extras: {
    applications?: { id: string; slug: string; updatedAt: string }[]
  }
  bbox?: number[]
  topics: { id: string; title: string; color: string }[]
  public: boolean
  userPermissions: string[]
  previews: {
    id: string
    title: string
    href: string
  }[]
}

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()
const route = useRoute()

const dataTab = ref<string | undefined>()

const datasetFetch = useLocalFetch<Dataset>('/data-fair/api/v1/datasets/' + route.params.ref, {
  params: {
    html: true,
    publicationSites: 'data-fair-portals:' + portal.value._id
  }
})

const dataset = computed(() => datasetFetch.data.value)

const applicationsUrl = computed(() => withQuery('/data-fair/api/v1/applications', {
  select: 'id,slug,title,summary,description,url,updatedAt,topics,preferLargeDisplay',
  size: 1000,
  html: true,
  dataset: datasetFetch.data.value?.id,
  publicationSites: 'data-fair-portals:' + portal.value._id
}))

const applicationsFetch = useLocalFetch<{ count: number, results: Application[] }>(applicationsUrl)

const orderedApplications = computed(() => {
  const datasetApplications = datasetFetch.data.value?.extras?.applications || []
  const applications = applicationsFetch.data.value?.results || []
  if (!datasetApplications.length || !applications.length) return []

  const ordered = datasetApplications.map(app => applications.find(a => a.id === app.id)).filter(a => a !== undefined) as Application[]
  const remaining = applications.filter(a => !ordered.find(app => app.id === a.id))
  return [...ordered, ...remaining]
})

const applicationCardConfig = computed(() => {
  const pageConfig = portalConfig.value.datasets.page.applications
  if (!pageConfig || pageConfig.useGlobalCard !== false) {
    return portalConfig.value.applications.card
  }
  return { ...portalConfig.value.applications.card, ...pageConfig.card }
})

// Fetch uses that reference this dataset
const usesUrl = computed(() => withQuery('/portal/api/uses', {
  dataset: datasetFetch.data.value?.id,
  limit: 100
}))

const usesFetch = useLocalFetch<{ results: Array<{ _id: string, slug: string, config: any, updated: any }>, total: number }>(usesUrl)

const datasetUses = computed(() => {
  return usesFetch.data.value?.results || []
})

const usesCardConfig = computed(() => {
  const pageConfig = portalConfig.value.datasets.page.uses
  if (!pageConfig || pageConfig.useGlobalCard !== false) {
    return portalConfig.value.uses.card
  }
  return { ...portalConfig.value.uses.card, ...pageConfig.card }
})

const errorTitle = computed(() => {
  const code = datasetFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('datasetNotFound')
  return t('datasetError')
})

const getPortalImageSrc = (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/images/${id}`
}

const thumbnailUrl = computed(() => {
  const cardConfig = portalConfig.value.datasets.card
  if (!cardConfig.thumbnail?.show || !dataset.value) return undefined
  if (dataset.value.image) return dataset.value.image
  if (cardConfig.thumbnail.useTopic && dataset.value.topics?.[0]?.id) {
    const topicConfig = portalConfig.value.topics?.find((t) => t.id === dataset.value!.topics[0]!.id)
    if (topicConfig?.thumbnail) return getPortalImageSrc(topicConfig.thumbnail, false)
  }
  if (cardConfig.thumbnail.useApplication && dataset.value.extras?.applications?.[0]) {
    return `/data-fair/api/v1/applications/${dataset.value.extras.applications[0].id}/capture?updatedAt=${dataset.value.extras.applications[0].updatedAt}`
  }
  if (cardConfig.thumbnail?.default) return getPortalImageSrc(cardConfig.thumbnail.default, false)
  return undefined
})

watch(dataset, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'datasets' },
    { title: dataset.value?.title || t('dataset'), disabled: true }
  ])
}, { immediate: true })

usePageSeo({
  title: () => dataset.value?.title || t('dataset'),
  description: () => dataset.value?.summary,
  ogImage: thumbnailUrl,
  ogType: 'article'
})

</script>

<i18n lang="yaml">
  en:
    application: Application
    backToDatasets: Back to datasets list
    dataset: Dataset
    datasetNotFound: The requested dataset was not found
    datasetError: An error occurred while loading the dataset
    sections:
      application: Linked application | Linked applications
      use: Linked use | Linked uses
      data: Data
      map: Map
      schema: Schema
      table: Table

  fr:
    application: Visualisation
    backToDatasets: Retour à la liste des jeux de données
    dataset: Jeu de données
    datasetNotFound: Le jeu de données demandé n'a pas été trouvé
    datasetError: Une erreur est survenue lors du chargement du jeu de données
    sections:
      application: Visualisation associée | Visualisations associées
      use: Réutilisation associée | Réutilisations associées
      data: Données
      map: Carte
      schema: Schéma
      table: Tableau
</i18n>
