<template>
  <template v-if="dataset">
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
    <template v-if="orderedApplications.length">
      <v-row
        v-for="app in orderedApplications"
        :key="app.id"
        align="center"
      >
        <v-col
          :md="app.preferLargeDisplay ? 12 : 6"
          cols="12"
        >
          <NuxtLink :to="`/applications/${app.slug}`">
            {{ app.title }} <v-icon
              :icon="mdiOpenInNew"
              color="primary"
            />
          </NuxtLink>
          <div
            class="mt-2"
            v-html="app.description"
          />
        </v-col>
        <v-col
          :md="app.preferLargeDisplay ? 12 : 6"
          cols="12"
          :order-md="!app.preferLargeDisplay ? 'first' : 1"
        >
          <d-frame-wrapper
            :iframe-title="`${t('application')} - ${app.title}`"
            :src="app.exposedUrl + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
            aspect-ratio
          />
        </v-col>
      </v-row>
    </template>

    <v-row
      class="my-4"
      justify="center"
    >
      <nav-link
        :to="`/datasets`"
        :icon="mdiChevronLeft"
        :text="t('backToDatasets')"
      />
    </v-row>
  </template>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiOpenInNew, mdiChevronLeft } from '@mdi/js'

type Application = {
  id: string
  slug: string
  title: string
  description: string
  exposedUrl: string
  preferLargeDisplay: boolean
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

const applicationsFetch = useLocalFetch<{ count: number, results: Application[] }>('/data-fair/api/v1/applications', {
  params: {
    select: 'id,slug,title,description,url,preferLargeDisplay',
    size: 1000,
    html: true,
    dataset: dataset.value?.id,
    publicationSites: 'data-fair-portals:' + portal.value._id
  }
})

const orderedApplications = computed(() => {
  const datasetApplications = datasetFetch.data.value?.extras?.applications || []
  const applications = applicationsFetch.data.value?.results || []
  if (!datasetApplications.length || !applications.length) return []

  const ordered = datasetApplications.map(app => applications.find(a => a.id === app.id)).filter(a => a !== undefined) as Application[]
  const remaining = applications.filter(a => !ordered.find(app => app.id === a.id))
  return [...ordered, ...remaining]
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
  fr:
    application: Visualisation
    backToDatasets: Retour à la liste des jeux de données
    dataset: Jeu de données
</i18n>
