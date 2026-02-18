<template>
  <v-select
    v-model="previewPortalId"
    :items="portalsItems"
    item-title="title"
    item-value="_id"
    :label="t('previewPortal')"
    :loading="portalsFetch.loading.value"
    class="mt-4 mx-4"
    density="compact"
    hide-details
    variant="outlined"
  />
</template>

<script setup lang="ts">

const { t } = useI18n()
const { previewPortalId, portalsFetch, pageStore } = usePreviewPortal()

const portalsItems = computed(() => {
  const allPortals = portalsFetch.data.value?.results ?? []
  const page = pageStore.pageFetch.data.value
  if (!page || !allPortals.length) return allPortals

  // show page's portals first, then the rest
  const pagePortalIds = new Set(page.portals)
  const pagePortals = allPortals.filter((p: { _id: string, title: string }) => pagePortalIds.has(p._id))
  const otherPortals = allPortals.filter((p: { _id: string, title: string }) => !pagePortalIds.has(p._id))
  return [...pagePortals, ...otherPortals]
})
</script>

<i18n lang="yaml">
  en:
    previewPortal: Preview portal
  fr:
    previewPortal: Portail de prévisualisation
</i18n>
