<template>
  <d-frame-wrapper
    :iframe-title="`${t('applications', 0)} - ${applicationFetch.data.value?.title} - ${t('fullscreen')}`"
    :src="`/data-fair/app/${$route.params.ref}?d-frame=true&primary=${$vuetify.theme.current.colors.primary}`"
    class="fill-height"
    resize="no"
    sync-params
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { setBreadcrumbs, clearBreadcrumbs } = useNavigationStore()
const { portalConfig } = usePortalStore()
const { t } = useI18n()
const route = useRoute()

const applicationFetch = useLocalFetch<{ title: string, summary?: string, description?: string, image?: string }>(`/data-fair/api/v1/applications/${route.params.ref}`)

watch(applicationFetch.data, () => {
  setBreadcrumbs([
    { title: t('applications', 1), href: '/applications' },
    { title: applicationFetch.data.value?.title || '', href: '/applications/' + route.params.ref },
    { title: t('fullscreen') }
  ])
}, { immediate: true })
onUnmounted(() => clearBreadcrumbs())

usePageSeo({
  title: () => applicationFetch.data.value?.title || t('applications', 0),
  description: () => applicationFetch.data.value?.summary || applicationFetch.data.value?.description || portalConfig.value.description,
  ogImage: () => applicationFetch.data.value?.image
})
</script>

<i18n lang="yaml">
  en:
    applications: Application | Applications
    fullscreen: Fullscreen
  fr:
    applications: Visualisation | Visualisations
    fullscreen: Plein écran
</i18n>
