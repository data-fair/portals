<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="application in displayedApplications"
      :key="application.id"
      :md="12 / element.columns"
      cols="12"
    >
      <application-card
        :application="application"
        :card-config="element.usePortalConfig ? portalConfig.applications.card : { ...portalConfig.applications.card, ...element.cardConfig }"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { ApplicationsListElement } from '#api/types/page-elements/index.ts'

type ApplicationFetch = { count: number; results: Application[] }

const { element } = defineProps<{ element: ApplicationsListElement }>()
const { portal, preview, portalConfig } = usePortalStore()

let displayedApplications: Application[] | ComputedRef<Application[]>

if (!preview) {
  const ids = element.applications?.map(app => app.id) || []
  const applicationsQuery = computed(() => ({
    select: 'id,slug,title,summary,updatedAt,image,url,topics,-userPermissions',
    ids: element.mode === 'custom' ? ids.join(',') : undefined,
    publicationSites: 'data-fair-portals:' + portal.value._id,
    size: element.mode !== 'custom' ? element.limit : undefined,
    sort: element.mode === 'lastUpdated' ? 'dataUpdatedAt:-1' : element.mode === 'lastCreated' ? 'createdAt:-1' : undefined
  }))

  const applicationsFetch = useLocalFetch<ApplicationFetch>('/data-fair/api/v1/applications', { query: applicationsQuery })
  displayedApplications = computed(() => {
    const results = applicationsFetch.data.value?.results || []
    if (element.mode === 'custom') return [...results].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)) // order by element.applications
    return results
  })
} else {
  const session = useSessionAuthenticated()

  // Mock data for preview
  displayedApplications = computed(() => {
    return Array.from({ length: element.mode === 'custom' ? (element.applications?.length || 1) : element.limit }, (_, i) => ({
      id: `application-${i + 1}`,
      slug: `application-${i + 1}`,
      title: element.applications?.[i]?.title || `Application ${i + 1}`,
      summary: 'Ceci est un exemple de visualisation pour la prévisualisation.',
      updatedAt: new Date().toISOString(),
      url: `https://example.com/app-${i + 1}`,
      href: `/applications/application-${i + 1}`,
      exposedUrl: `https://example.com/app-${i + 1}`,
      owner: session.account.value,
      topics: [{ id: 'topic-1', title: 'Topic exemple', color: '#45d31d' }]
    }))
  })
}

</script>
