<template>
  <layout-page :is-fluid="pageConfigFetch.data.value?.fluid">
    <!-- Error state -->
    <page-error
      v-if="pageConfigFetch.error.value"
      :status-code="pageConfigFetch.error.value.statusCode || 500"
    />

    <page-elements
      v-else-if="pageConfigFetch.data.value"
      :model-value="pageConfigFetch.data.value.elements"
    />
  </layout-page>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs, setShowBreadcrumbs } = useNavigationStore()
providePageImageSrc('reuses')

const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/reuses/reuses', { watch: false })
provide('page-config', pageConfigFetch.data)

watch(() => pageConfigFetch.data.value, (pageConfig) => {
  setBreadcrumbs([{ type: 'standard', subtype: 'reuses', title: pageConfigFetch.data.value?.title }])
  setShowBreadcrumbs(pageConfig?.showBreadcrumbs)
}, { immediate: true })

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('reuses')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || t('seoDescription')
})
</script>

<i18n lang="yaml">
  en:
    reuses: Reuses
    seoDescription: 'Discover how our data is utilized by our users: explore reuses, applications, and innovative projects from the community.'
  fr:
    reuses: Réutilisations
    seoDescription: 'Découvrez comment nos données sont exploitées par nos utilisateurs : parcourez les réutilisations, applications et projets innovants de la communauté.'
</i18n>
