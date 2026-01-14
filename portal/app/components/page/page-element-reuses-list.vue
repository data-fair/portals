<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="reuse in displayedReuses"
      :key="reuse._id"
      :md="12 / element.columns"
      cols="12"
    >
      <reuse-card
        :reuse="reuse"
        :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.reuses.card"
        :is-portal-config="element.usePortalConfig || !element.cardConfig"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse'
import type { ReusesListElement } from '#api/types/page-elements'

type ReuseFetch = { count: number; results: Pick<Reuse, '_id' | 'slug' | 'config' | 'updatedAt'>[] }

const { element } = defineProps<{ element: ReusesListElement }>()
const { portalConfig, preview } = usePortalStore()

let displayedReuses: ComputedRef<ReuseFetch['results']>

if (!preview) {
  const slugs = element.reuses?.map(r => r.slug) || []
  const reusesQuery = computed(() => ({
    slugs: element.mode === 'custom' ? slugs.join(',') : undefined,
    size: element.mode !== 'custom' ? element.limit : undefined,
    sort: element.mode === 'lastUpdated' ? 'updatedAt:-1' : element.mode === 'lastCreated' ? 'createdAt:-1' : undefined
  }))

  const reusesFetch = useFetch<ReuseFetch>('/portal/api/reuses', { query: reusesQuery })
  displayedReuses = computed(() => {
    const results = reusesFetch.data.value?.results || []
    if (element.mode === 'custom') return [...results].sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug))
    return results
  })
} else {
  // Mock data for preview
  displayedReuses = computed(() => {
    return Array.from({ length: element.mode === 'custom' ? (element.reuses?.length || 1) : element.limit }, (_, i) => ({
      _id: `reuse-${i + 1}`,
      slug: element.reuses?.[i]?.slug || `reuse-${i + 1}`,
      config: {
        title: element.reuses?.[i]?.title || `Réutilisation ${i + 1}`
      },
      updatedAt: new Date().toISOString()
    }))
  })
}
</script>
