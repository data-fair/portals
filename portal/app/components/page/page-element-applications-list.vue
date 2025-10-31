<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="application in applications"
      :key="application.id"
      :md="12 / element.columns"
      cols="12"
    >
      <application-card
        :application="application"
        :card-config="element.usePortalConfig ? portalConfig.datasets.card : { ...portalConfig.datasets.card, ...element.cardConfig }"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/account'
import type { ApplicationsListElement } from '#api/types/page-elements'

type Application = {
  id: string
  slug: string
  title: string
  summary: string
  updatedAt: string
  image?: string
  url: string
  href: string
  exposedUrl: string
  owner: Account
  topics: { id: string; title: string; color: string }[]
}

type ApplicationFetch = {
  count: number
  results: Application[]
}

const { element } = defineProps<{ element: ApplicationsListElement }>()
const { portal, preview, portalConfig } = usePortalStore()

let applications: Application[] | ComputedRef<Application[]>

if (!preview) {
  const applicationsQuery = computed(() => ({
    select: 'id,slug,title,summary,updatedAt,image,url,topics,-userPermissions',
    publicationSites: 'data-fair-portals:' + portal.value._id,
    size: element.limit,
    sort: 'createdAt:-1' // Latest applications first
  }))

  const applicationsFetch = useLocalFetch<ApplicationFetch>('/data-fair/api/v1/applications', { query: applicationsQuery })
  applications = computed(() => applicationsFetch.data.value?.results || [])
} else {
  // Mock data for preview
  applications = Array.from({ length: Math.min(element.limit, 3) }, (_, i) => ({
    id: `application-${i + 1}`,
    slug: `application-${i + 1}`,
    title: `Visualisation ${i + 1}`,
    summary: 'Ceci est un exemple de visualisation pour la prévisualisation.',
    updatedAt: new Date().toISOString(),
    url: `https://example.com/app-${i + 1}`,
    href: `/applications/application-${i + 1}`,
    exposedUrl: `https://example.com/app-${i + 1}`,
    owner: { id: 'owner-1', name: 'Organisation exemple', type: 'organization' } as Account,
    topics: [{ id: 'topic-1', title: 'Topic exemple', color: '#45d31d' }]
  }))
}

</script>
