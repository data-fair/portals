<template>
  <d-frame-wrapper
    :iframe-title="`${t('application')} - ${applicationFetch.data.value?.title} - ${t('fullscreen')}`"
    :src="`/data-fair/app/${$route.params.ref}?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
    class="fill-height"
    resize="no"
    sync-params
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { setBreadcrumbs } = useNavigationStore()
const { portalConfig } = usePortalStore()
const { t } = useI18n()
const route = useRoute()

const applicationFetch = useLocalFetch<{ title: string, summary?: string, description?: string, image?: string }>(`/data-fair/api/v1/applications/${route.params.ref}`)

watch(applicationFetch.data, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'applications' },
    { title: applicationFetch.data.value?.title || t('application'), to: '/applications/' + route.params.ref },
    { title: t('fullscreen') }
  ])
}, { immediate: true })

usePageSeo({
  title: () => applicationFetch.data.value?.title || t('application'),
  description: () => applicationFetch.data.value?.summary || applicationFetch.data.value?.description || portalConfig.value.description,
  ogImage: () => applicationFetch.data.value?.image
})
</script>

<i18n lang="yaml">
  en:
    application: Application
    fullscreen: Fullscreen
  fr:
    application: Visualisation
    fullscreen: Plein écran
</i18n>
