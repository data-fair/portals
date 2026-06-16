<template>
  <div
    v-if="element.application?.slug"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
  >
    <application-actions
      v-if="hasActions && application && element.actionButtons?.position !== 'bottom'"
      :application="application"
      :actions="element.actionButtons?.items"
      :action-style="element.actionButtons?.style"
      :alignment="element.actionButtons?.alignment ?? 'start'"
    />

    <!-- In preview, we just show a screenshot for performance reasons -->
    <v-img
      v-if="preview && application"
      :src="`${application.href}/capture?updatedAt=${application.updatedAt}`"
      :title="t('previewTooltip')"
      :alt="application.title"
      :height="displayMode === 'fixed-height' ? fixedHeight : undefined"
      :cover="displayMode === 'fixed-height'"
    />

    <d-frame-wrapper
      v-else
      :iframe-title="`${t('application')} - ${element.application.title}`"
      :src="'/data-fair/app/' + element.application.slug + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
      :sync-params="syncParams"
      :aspect-ratio="displayMode !== 'fixed-height' ? '' : undefined"
      :height="displayMode === 'fixed-height' ? fixedHeight + 'px' : undefined"
      :resize="displayMode === 'auto-resize' ? undefined : 'no'"
    />

    <application-actions
      v-if="hasActions && application && element.actionButtons?.position === 'bottom'"
      :application="application"
      :actions="element.actionButtons?.items"
      :action-style="element.actionButtons?.style"
      :alignment="element.actionButtons?.alignment ?? 'start'"
    />
  </div>
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { ApplicationElement } from '#api/types/page-elements/index.ts'
import { usePageFilterDescribeTool } from '../../../composables/agent/page-filter-describe-tool'

const { element } = defineProps<{ element: ApplicationElement }>()
const { t } = useI18n()
const { preview } = usePortalStore()

// A shared-filters application reflects all page filters (concept + every dataset).
if (element.syncParams === 'shared-filters' && element.uuid) {
  usePageFilterDescribeTool({
    uuid: element.uuid,
    title: `Filtres : ${element.application?.title ?? 'visualisation'}`,
    description: `This page has a visualization "${element.application?.title ?? ''}" that reflects all page filters: concept filters (keys starting with "_c") and every dataset filter (keys starting with "_d_"). Use pageFilters_set to drive it.`
  })
}

const syncParams = computed(() => {
  const uuid = element.uuid || crypto.randomUUID().split('-')[0] // Prevent undefined uuid
  if (element.syncParams === 'sandboxed') return `*:${uuid}_`
  if (element.syncParams === 'shared-filters') return `_c*,_d*,*:${uuid}_`
  return undefined
})

const hasActions = computed(() => (element.actionButtons?.items ?? []).length > 0)

const displayMode = computed(() => element.displayMode ?? 'auto-resize')
const fixedHeight = computed(() => element.height ?? 500)

const applicationFetcher = preview ? useFetch<Application> : useLocalFetch<Application>
const applicationFetch = applicationFetcher(() => element.application?.id ? '/data-fair/api/v1/applications/' + element.application.id : '')
const application = computed(() => applicationFetch.data.value)
</script>

<i18n lang="yaml">
  en:
    application: Application
    previewTooltip: For performance reasons, the preview only shows a screenshot of the visualization
  fr:
    application: Application
    previewTooltip: Pour des raisons de performance, l'aperçu affiche uniquement une capture de la visualisation
</i18n>
