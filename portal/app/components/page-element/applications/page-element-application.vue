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

    <!-- d-frame calcule sa hauteur uniquement à partir de sa propre largeur : il ne peut pas
         se rétrécir tout seul pour respecter une hauteur maximale. Ce conteneur plafonne donc
         la largeur (maxHeight × ratio) pour que la hauteur déduite reste sous le maximum,
         sans recadrer le contenu. -->
    <div
      v-else
      class="mx-auto"
      :style="pillarboxStyle"
    >
      <d-frame-wrapper
        :iframe-title="`${t('application')} - ${element.application.title}`"
        :src="'/data-fair/app/' + element.application.slug + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
        :sync-params="syncParams"
        :aspect-ratio="frameAspectRatio"
        :height="displayMode === 'fixed-height' ? fixedHeight + 'px' : undefined"
        :resize="displayMode === 'auto-resize' ? undefined : 'no'"
      />
    </div>

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

// A fixed ratio can be given as "16/9" or a plain number ("1.78"). "auto" (the default)
// keeps the current responsive behavior, so it resolves to no fixed ratio.
const parsedRatio = computed(() => {
  if (displayMode.value !== 'aspect-ratio' || !element.ratio || element.ratio === 'auto') return undefined
  const parts = element.ratio.split(/[/:xX]/)
  if (parts.length === 2) {
    const a = Number(parts[0]); const b = Number(parts[1])
    if (a > 0 && b > 0) return a / b
  }
  const n = Number(element.ratio)
  return n > 0 ? n : undefined
})

// '' lets d-frame pick its own ratio depending on the viewport width.
const frameAspectRatio = computed(() => {
  if (displayMode.value === 'fixed-height') return undefined
  return parsedRatio.value !== undefined ? String(parsedRatio.value) : ''
})

// d-frame only ever derives its height from its own width. To respect a max height without
// cropping, the width itself must be capped here so the derived height stays under the max.
const pillarboxStyle = computed(() => {
  if (parsedRatio.value !== undefined && element.maxHeight) {
    return { width: `min(100%, ${element.maxHeight * parsedRatio.value}px)` }
  }
  return undefined
})

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
