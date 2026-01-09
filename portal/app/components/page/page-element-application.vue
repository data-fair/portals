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
    :sync-params="element.syncParams ? '*:' + element.application.id + '-app_' : undefined"
    aspect-ratio
  />
</template>

<script setup lang="ts">
import type { Application } from '#api/types/index.ts'
import type { ApplicationElement } from '#api/types/page-config'

const { element } = defineProps<{ element: ApplicationElement }>()
const { t } = useI18n()
const { preview } = usePortalStore()

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
