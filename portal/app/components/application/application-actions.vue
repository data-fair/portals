<template>
  <v-row
    :justify="alignment"
    no-gutters
    class="ga-1"
  >
    <action-btn
      v-if="showAction('fullscreen')"
      :to="{ path: `/applications/${application.slug}/full`, query: $route.query }"
      :action-style="actionStyle"
      :icon="mdiFullscreen"
      :resource-title="application.title"
      :text="t('fullscreen')"
      :tooltip="t('fullscreenTooltip')"
    />
    <application-capture
      v-if="showAction('capture')"
      :application="application"
      :action-style="actionStyle"
    />
    <application-embed
      v-if="showAction('embed') && !$vuetify.display.smAndDown"
      :application="application"
      :action-style="actionStyle"
    />
    <action-btn
      v-if="showAction('datasets') && datasetsLink"
      :to="datasetsLink"
      :action-style="actionStyle"
      :icon="mdiDatabaseOutline"
      :resource-title="application.title"
      :text="t('datasets', datasetsCount)"
      :tooltip="t('datasetsTooltip', datasetsCount)"
    />
  </v-row>
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { ApplicationElement } from '#api/types/page-elements/index.ts'
import type { DatasetCard } from '#api/types/portal/index.js'
import type { RouteLocationRaw } from 'vue-router'
import { mdiDatabaseOutline, mdiFullscreen } from '@mdi/js'

type ApplicationAction = NonNullable<NonNullable<ApplicationElement['actionButtons']>['items']>[number]
type AppConfig = { datasets?: { id?: string; slug?: string; href: string }[] }

const { application, actions = [] } = defineProps<{
  application: Application
  actions?: readonly ApplicationAction[]
  actionStyle?: DatasetCard['actionsStyle']
  alignment?: 'start' | 'center' | 'end'
}>()

const { t } = useI18n()
const { preview } = usePortalStore()

const showAction = (action: ApplicationAction) => actions.includes(action)

const fetcher = preview ? useFetch<AppConfig> : useLocalFetch<AppConfig>
const appConfigFetch = showAction('datasets')
  ? fetcher(() => application.id ? `/data-fair/api/v1/applications/${application.id}/configuration` : '')
  : undefined

const datasets = computed(() => {
  const items = appConfigFetch?.data.value?.datasets
  if (!items) return []
  return items
    .map(d => ({ id: d.id || d.href.split('/').pop(), slug: d.slug }))
    .filter((d): d is { id: string; slug?: string } => !!d.id)
})
const datasetsCount = computed(() => datasets.value.length)
const datasetsLink = computed<RouteLocationRaw | undefined>(() => {
  const items = datasets.value
  if (items.length === 0) return undefined
  if (items.length === 1) return `/datasets/${items[0].slug || items[0].id}`
  return { path: '/datasets', query: { ids: items.map(d => d.id).join(',') } }
})
</script>

<i18n lang="yaml">
  en:
    fullscreen: Fullscreen
    fullscreenTooltip: Open the application in full page
    datasets: No data source | Data source | Data sources
    datasetsTooltip: No data source used | View the data source used | View the data sources used
  fr:
    fullscreen: Plein écran
    fullscreenTooltip: Ouvrir la visualisation en pleine page
    datasets: Aucune source de données | Source de données | Sources de données
    datasetsTooltip: Aucune source de données utilisée | Voir la source de données utilisée | Voir les sources de données utilisées
</i18n>
