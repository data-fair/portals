<template>
  <v-row class="justify-center align-center">
    <v-col
      v-for="key in element.metrics"
      :key="key"
      :cols="!element.fullWidth ? 'auto' : undefined"
    >
      <v-card
        :border="element.border"
        :elevation="element.elevation"
        :rounded="element.rounded"
        :class="[element.mb !== 0 && `mb-${element.mb ?? 4}`, 'text-center']"
        :color="element.color"
      >
        <v-card-text>
          <h4 class="text-h4 font-weight-bold">{{ metrics[key] }}</h4>
          <h5 class="text-h5 font-weight-light">{{ t('title.' + key) }}</h5>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { MetricsElement } from '#api/types/page-config'

const { element } = defineProps({
  element: { type: Object as () => MetricsElement, required: true }
})

const { preview, portal } = usePortalStore()
const { t } = useI18n()

let metrics: { datasets: number, records: number, applications: number } | ComputedRef<{ datasets: number, records: number, applications: number }>
if (!preview) {
  // TODO: stats for private user ? (owner and visibility)
  const datasetsMetricsFetch = useLocalFetch<{ count: number, sums: { count: number } }>('/data-fair/api/v1/datasets', {
    query: {
      sums: 'count',
      size: 0,
      publicationSites: 'data-fair-portals:' + portal.value._id,
    }
  })
  const applicationsMetricsFetch = useLocalFetch<{ count: number, sums: { count: number } }>('/data-fair/api/v1/applications', {
    query: {
      size: 0,
      publicationSites: 'data-fair-portals:' + portal.value._id,
    }
  })

  metrics = computed(() => ({
    datasets: datasetsMetricsFetch.data.value?.count || 0,
    records: datasetsMetricsFetch.data.value?.sums.count || 0,
    applications: applicationsMetricsFetch.data.value?.count || 0,
  }))
} else {
  metrics = {
    datasets: 100,
    records: 10_000_000,
    applications: 10
  }
}

</script>

<i18n lang="yaml">
  en:
    title:
      datasets: Datasets
      records: Records
      applications: Applications
  fr:
    title:
      datasets: Jeux de données
      records: Enregistrements
      applications: Visualisations
</i18n>
