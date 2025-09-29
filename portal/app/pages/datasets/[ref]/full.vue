<template>
  <d-frame-wrapper
    :iframe-title="`${t('datasets', 0)} - ${datasetFetch.data.value?.title} - ${t('fullscreen')}`"
    :src="`/data-fair/next-ui/embed/dataset/${$route.params.ref}/table`"
    class="fill-height"
    scrolling="no"
    sync-params
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'full' })

const { setBreadcrumbs } = useNavigationStore()
const { t } = useI18n()
const route = useRoute()

const datasetFetch = useLocalFetch<{ title: string }>(`/data-fair/api/v1/datasets/${route.params.ref}`)

watch(datasetFetch.data, () => {
  setBreadcrumbs([
    { title: t('datasets', 1), href: '/datasets' },
    { title: datasetFetch.data.value?.title || '', href: '/datasets/' + route.params.ref },
    { title: t('fullscreen') }
  ], route.name as string)
}, { immediate: true })
</script>

<i18n lang="yaml">
  en:
    datasets: Dataset | Datasets
    fullscreen: Fullscreen
  fr:
    datasets: Jeu de données | Jeux de données
    fullscreen: Plein écran
</i18n>
