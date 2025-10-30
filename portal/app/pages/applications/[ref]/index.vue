<template>
  <template v-if="application">
    <h1 class="text-h4 mb-4">
      {{ application.title }}
    </h1>

    <v-row>
      <!-- Application image and description -->
      <v-col
        :md="metadataLocation === 'right' ? 8 : 12"
        cols="12"
      >
        <img
          v-if="portalConfig.applications.page.showImage && application.image"
          :alt="application.title"
          :src="application.image"
          class="mb-4"
          style="max-height:300px"
        >
        <div v-html="application.description" />
      </v-col>

      <!-- Metadata -->
      <v-col
        :md="metadataLocation === 'right' ? 4 : 12"
        :order-md="metadataLocation === 'top' ? 'first' : 1"
        cols="12"
      >
        <application-metadata :application="application" />
      </v-col>
    </v-row>
    <d-frame-wrapper
      :iframe-title="`${t('application')} - ${application.title}`"
      :src="`/data-fair/app/${$route.params.ref}?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
      class="mt-2"
      aspect-ratio
    />

    <!-- Datasets Source -->
    <template v-if="datasetsFetch.data.value?.results.length">
      <h5 class="text-h5 my-4">{{ t('datasetsUsed', datasetsFetch.data.value?.results.length) }}</h5>
      <v-row class="d-flex align-stretch mt-2">
        <v-col
          v-for="(dataset, i) in datasetsFetch.data.value?.results"
          :key="i"
          :md="12 / portalConfig.datasets.list.columns"
          cols="12"
        >
          <dataset-card
            :dataset="dataset"
            :card-config="portalConfig.datasets.card"
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
        :icon="mdiReply"
        :text="t('backToApplications')"
      />
    </v-row>
  </template>
</template>

<script setup lang="ts">
import { mdiReply } from '@mdi/js'
import type { Account } from '@data-fair/lib-common-types/account'

type Application = {
  id: string
  slug: string
  title: string
  summary?: string
  description?: string
  updatedAt: string
  image?: string
  url: string
  href: string
  exposedUrl: string
  public: boolean
  owner: Account
  topics: { id: string; title: string }[]
}

type Dataset = {
  id: string
  slug: string
  title: string
  summary: string
  dataUpdatedAt: string
  updatedAt: string
  owner: Account
  extras: {
    applications?: { id: string; updatedAt: string }[]
  }
  bbox?: number[]
  topics: { id: string; title: string; color: string }[]
  keywords?: string[]
  image?: string
  isMetaOnly: boolean
}

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const route = useRoute()

const applicationFetch = useLocalFetch<Application>('/data-fair/api/v1/applications/' + route.params.ref, {
  params: {
    html: true,
    publicationSites: 'data-fair-portals:' + portal.value._id
  }
})
const application = computed(() => applicationFetch.data.value)
const metadataLocation = computed(() => portalConfig.value.applications.page.metadataLocation || 'right')

const appConfigFetch = useLocalFetch<{ datasets: { id: string, href: string }[] }>(
  '/data-fair/api/v1/applications/' + route.params.ref + '/configuration'
)

const datasetsFetch = useLocalFetch<{ count: number, results: Dataset[] }>('/data-fair/api/v1/datasets', {
  params: {
    select: 'id,slug,title,description,updatedAt,dataUpdatedAt,extras,bbox,topics,keywords,image,-userPermissions',
    size: 1000,
    html: true,
    ids: appConfigFetch.data.value?.datasets?.map(d => d.id || d.href.split('/').pop()).join(',') || '',
    publicationSites: 'data-fair-portals:' + portal.value._id
  }
})

usePageSeo({
  title: () => application.value?.title || t('application'),
  description: () => application.value?.summary || application.value?.description || portalConfig.value.description,
  ogImage: () => application.value?.image,
  ogType: 'article'
})

</script>

<i18n lang="yaml">
  en:
    application: Application
    backToApplications: Back to applications list
    datasetsUsed: Dataset used | Datasets used
  fr:
    application: Visualisation
    backToApplications: Retour à la liste des visualisations
    datasetsUsed: Jeu de données utilisé | Jeux de données utilisés
</i18n>
