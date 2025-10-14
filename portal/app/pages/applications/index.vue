<template>
  <!-- Page Title -->
  <h1 class="text-h4 mb-4">
    {{ t('applicationsCount', { count: applicationsFetch.data.value?.count || 0 }) }}
  </h1>

  <!-- Filters -->
  <v-row>
    <!-- Search -->
    <v-col
      cols="12"
      md="4"
    >
      <v-text-field
        v-model="search"
        :append-inner-icon="mdiMagnify"
        :label="t('search')"
        density="comfortable"
        variant="outlined"
        autofocus
        clearable
        hide-details
      />
    </v-col>

    <!-- Base applications filter -->
    <v-col
      cols="12"
      md="4"
    >
      <v-autocomplete
        v-model="filters.baseApplications.value"
        :loading="false"
        :items="applicationsFetch.data.value?.facets?.['base-application'] ?? []"
        :label="t('filters.baseApplications')"
        :no-data-text="t('filters.noBaseApplications')"
        item-title="value.title"
        item-value="value.url"
        density="comfortable"
        variant="outlined"
        chips
        clearable
        closable-chips
        multiple
        hide-details
      />
    </v-col>

    <!-- Topics filters (mobile view)-->
    <v-col
      v-if="$vuetify.display.smAndDown"
      cols="12"
    >
      <v-autocomplete
        v-model="filters.topics.value"
        :label="t('filters.topics')"
        :no-data-text="t('filters.noTopics')"
        :items="topicsItems"
        :item-title="(item) => `${item.title} (${item.count})`"
        item-value="id"
        density="comfortable"
        variant="outlined"
        chips
        clearable
        closable-chips
        multiple
        hide-details
      />
    </v-col>

    <!-- TODO: Add owner filter -->

    <!-- Sort/Order -->
    <v-col
      cols="12"
      md="4"
    >
      <v-select
        v-model="sort"
        :items="sortItems"
        :label="t('sort.by')"
        density="comfortable"
        variant="outlined"
        hide-details
        clearable
      >
        <template #append>
          <!-- Order toggle -->
          <v-btn-toggle
            v-model="order"
            variant="outlined"
            mandatory
          >
            <v-btn
              :icon="mdiSortDescending"
              :title="t('descending')"
            />
            <v-btn
              :icon="mdiSortAscending"
              :title="t('ascending')"
            />
          </v-btn-toggle>
        </template>
      </v-select>
    </v-col>

    <!-- Topics filter (desktop view)-->
    <v-col
      v-if="!$vuetify.display.smAndDown"
      cols="12"
    >
      <topics-filter
        v-model="filters.topics.value"
        :topics="topicsItems"
      />
    </v-col>
  </v-row>

  <!-- TODO: Add infinite scroll -->
  <v-row class="d-flex align-stretch mt-2">
    <v-col
      v-for="(application, i) in applicationsFetch.data.value?.results"
      :key="i"
      :md="12 / portalConfig.datasets.columns"
      cols="12"
    >
      <application-card
        :application="application"
        :card-config="portalConfig.applications"
      />
    </v-col>
  </v-row>

  <!-- TODO: Show loading spinner -->
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import { mdiMagnify, mdiSortAscending, mdiSortDescending } from '@mdi/js'

type ApplicationFetch = {
  count: number
  facets: {
    'base-application': { value: { title: string; url: string }; count: number }[]
    topics: { value: { id: string; title: string; color: string; icon?: { svgPath: string } }; count: number }[]
    owner: { value: { id: string; name: string; department?: string }; count: number }[]
  }
  results: {
    id: string
    slug: string
    title: string
    description: string
    updatedAt: string
    image?: string
    url: string
    href: string
    exposedUrl: string
    owner: Account
    topics: { id: string; title: string }[]
  }[]
}

const { t } = useI18n()
const { portal, portalConfig } = usePortalStore()
const search = useStringSearchParam('q')
const sort = useStringSearchParam('sort', { default: portalConfig.value.applications.defaultSort })
const filters = {
  baseApplications: useStringsArraySearchParam('base-application'),
  topics: useStringsArraySearchParam('topic'),
  owners: useStringsArraySearchParam('owner')
}
const order = ref(0) // 0 = desc, 1 = asc

const applicationsQuery = computed(() => {
  const query: Record<string, string> = {
    select: 'id,slug,title,description,updatedAt,image,url,topics,-userPermissions',
    facets: 'base-application,topics,owner',
    publicationSites: 'data-fair-portals:' + portal.value._id,
    truncate: '250'
  }
  if (search.value) query.q = search.value
  if (sort.value !== portalConfig.value.applications.defaultSort || order.value !== 0) query.sort = sort.value + ':' + (order.value * 2 - 1)
  if (filters.baseApplications.value?.length) query['base-application'] = filters.baseApplications.value.join(',')
  if (filters.topics.value?.length) query.topics = filters.topics.value.join(',')
  if (filters.owners.value?.length) query.owner = filters.owners.value.join(',')
  return query
})
const applicationsFetch = useLocalFetch<ApplicationFetch>('/data-fair/api/v1/applications', { query: applicationsQuery })

const topicsItems = computed(() => {
  const facets = applicationsFetch.data.value?.facets?.topics ?? []
  return facets.map(facet => ({ ...facet.value, count: facet.count }))
})

const sortItems = [
  { title: t('sort.createdAt'), value: 'createdAt' },
  { title: t('sort.dataUpdatedAt'), value: 'dataUpdatedAt' },
  { title: t('sort.title'), value: 'title' }
]

useSeoMeta({
  title: t('seo.title', { title: portalConfig.value.title }),
  description: t('seo.description'),
  ogTitle: t('seo.title', { title: portalConfig.value.title }),
  ogDescription: t('seo.description'),
  ogType: 'website'
})

</script>

<i18n lang="yaml">
  en:
    applicationsCount: '{count} application | {count} applications'
    ascending: Ascending order
    descending: Descending order
    filters:
      baseApplications: Application
      noBaseApplications: No applications available
      topics: Topics
      noTopics: No topics available
    search: Search
    seo:
      title: 'Applications - {title}'
      description: 'Explore our open data visualizations: interactive maps, charts, and tables to analyze and understand data.'
    sort:
      by: Sort by
      createdAt: Creation date
      dataUpdatedAt: Data update date
      title: Alphabetical order

  fr:
    applicationsCount: '{count} application | {count} applications'
    ascending: Ordre croissant
    descending: Ordre décroissant
    filters:
      baseApplications: Application
      noBaseApplications: Aucune application disponible
    search: Rechercher
    seo:
      title: 'Visualisations - {title}'
      description: 'Explorez nos visualisations de données ouvertes : cartes interactives, graphiques et tableaux pour analyser et comprendre les données.'
    sort:
      by: Trier par
      createdAt: Date de création
      dataUpdatedAt: Date de mise à jour des données
      title: Ordre alphabétique
</i18n>
