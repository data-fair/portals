<template>
  <!-- Error state -->
  <page-error
    v-if="reuseFetch.error.value"
    :status-code="reuseFetch.error.value.statusCode || 500"
    :title="errorTitle"
    :link="reusesCatalogExists ? {
      type: 'standard',
      subtype: 'reuses',
      title: t('backToReuses')
    } : undefined"
  />

  <reuse-preview
    v-else-if="reuseConfig"
    :reuse-config="reuseConfig"
    :slug="slug"
    :reuses-catalog-exists="reusesCatalogExists"
  />
</template>

<script setup lang="ts">
import type { LinkItem } from '#api/types/portal'
import type { Reuse } from '#api/types/reuse'
import type { VBreadcrumbs } from 'vuetify/components'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

type BreadcrumbItem = NonNullable<VBreadcrumbs['$props']['items']>[number]

const reuseFetch = await useFetch<Pick<Reuse, '_id' | 'slug' | 'config'>>(`/portal/api/reuses/${slug}`, {
  watch: false
})
const reuseConfig = computed(() => reuseFetch.data.value?.config)

const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const reusesCatalogExists = computed(() => standardPagesFetch.data.value?.reuses || false)

const errorTitle = computed(() => {
  const code = reuseFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('reuseNotFound')
  return t('reuseError')
})

watch([reusesCatalogExists, reuseConfig], () => {
  const items: (LinkItem | BreadcrumbItem)[] = []
  if (reusesCatalogExists.value) { items.push({ type: 'standard', subtype: 'reuses' }) }
  items.push({ title: reuseConfig.value?.title || t('reuse') })
  setBreadcrumbs(items)
}, { immediate: true })

usePageSeo({
  title: () => (reuseConfig.value?.title || t('reuse')) + ' - ' + portalConfig.value.title,
  description: () => reuseConfig.value?.summary,
  ogType: 'article'
})
</script>

<i18n lang="yaml">
  en:
    reuse: Reuse
    reuseNotFound: The requested reuse was not found
    reuseError: An error occurred while loading the reuse
  fr:
    reuse: Réutilisation
    reuseNotFound: La réutilisation demandée n'a pas été trouvée
    reuseError: Une erreur est survenue lors du chargement de la réutilisation
</i18n>
