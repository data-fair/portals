<template>
  <!-- In preview, we just show a screenshot -->
  <v-img
    v-if="preview && applicationFetch?.data?.value"
    :src="`${applicationFetch.data?.value.href}/capture?updatedAt=${applicationFetch.data?.value.updatedAt}`"
  />

  <d-frame-wrapper
    v-if="!preview && element.application?.slug"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :iframe-title="`${t('application')} - ${element.application.title}`"
    :src="'/data-fair/app/' + element.application.slug + `?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
    :sync-params="syncParams"
    aspect-ratio
  />
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { ApplicationElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: ApplicationElement }>()
const { t } = useI18n()
const { preview } = usePortalStore()

const syncParams = computed(() => {
  const uuid = element.uuid || crypto.randomUUID().split('-')[0] // Prevent undefined uuid
  if (element.syncParams === 'sandboxed') return `*:${uuid}_`
  if (element.syncParams === 'shared-filters') return `_c*,_d*,*:${uuid}_`
  return undefined
})

let applicationFetch
if (preview) {
  applicationFetch = useFetch<Application>(() => element.application?.id ? '/data-fair/api/v1/applications/' + element.application?.id : '')
}

</script>

<i18n lang="yaml">
  en:
    application: Application
  fr:
    application: Application
</i18n>
