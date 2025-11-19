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
    <h1 class="text-h4 mb-4">
      {{ dataset.title }}
    </h1>

    <v-row>
      <!-- Dataset image and description -->
      <v-col
        :md="portalConfig.datasets.page.metadataLocation === 'right' ? 8 : 12"
        cols="12"
      >
        <img
          v-if="portalConfig.datasets.page.showImage && dataset.image"
          :alt="dataset.title"
          :src="dataset.image"
          class="mb-4"
          style="max-height:300px"
        >
        <!--eslint-disable-next-line vue/no-v-html -->
        <div v-html="dataset.description" />
      </v-col>

      <!-- Metadata -->
      <v-col
        :md="portalConfig.datasets.page.metadataLocation === 'right' ? 4 : 12"
        :order-md="portalConfig.datasets.page.metadataLocation === 'top' ? 'first' : 1"
        cols="12"
      >
        <dataset-metadata :dataset="dataset" />
      </v-col>
    </v-row>

    <!-- Applications -->
    <template v-if="orderedApplications.length && portalConfig.datasets.page.applications?.display !== 'none'">
      <h2 class="text-h5 mt-8 mb-4">
        {{ t('linkedApplication', { count: orderedApplications.length }) }}
      </h2>

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
              <!--eslint-disable-next-line vue/no-v-html -->
              <div
                class="mt-2"
                v-html="app.description"
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
              <!--eslint-disable-next-line vue/no-v-html -->
              <div
                class="mt-2"
                v-html="app.description"
              />
            </v-col>
          </template>
        </v-row>
      </template>
    </template>

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
  public: boolean
  userPermissions: string[]
}

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const route = useRoute()

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

const errorTitle = computed(() => {
  const code = datasetFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('datasetNotFound')
  return t('datasetError')
})

usePageSeo({
  title: () => dataset.value?.title || t('dataset'),
  description: () => dataset.value?.summary || dataset.value?.description || portalConfig.value.description,
  ogImage: () => dataset.value?.image,
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
    linkedApplication: Linked application | Linked applications

  fr:
    application: Visualisation
    backToDatasets: Retour à la liste des jeux de données
    dataset: Jeu de données
    datasetNotFound: Le jeu de données demandé n'a pas été trouvé
    datasetError: Une erreur est survenue lors du chargement du jeu de données
    linkedApplication: Visualisation associée | Visualisations associées
</i18n>
