<template>
  <layout-page>
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
  </layout-page>
</template>

<script setup lang="ts">
import type { LinkItem } from '#api/types/portal'
import type { Reuse } from '#api/types/reuse'
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { VBreadcrumbs } from 'vuetify/components'

const route = useRoute()
const slug = route.params.slug as string

const { t } = useI18n()
const { portalConfig, preview } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()

type BreadcrumbItem = NonNullable<VBreadcrumbs['$props']['items']>[number]

const reuseFetch = await useFetch<Pick<Reuse, '_id' | 'slug' | 'config' | 'updatedAt'>>(`/portal/api/reuses/${slug}`, { watch: false })
const reuseConfig = computed(() => reuseFetch.data.value?.config)

const standardPagesFetch = await useFetch<Record<string, boolean>>('/portal/api/pages/standard-exists', { watch: false })
const reusesCatalogExists = computed(() => standardPagesFetch.data.value?.reuses || false)

const errorTitle = computed(() => {
  const code = reuseFetch.error.value?.statusCode
  if (code === 401 || code === 403) return undefined
  if (code === 404) return t('reuseNotFound')
  return t('reuseError')
})

const getReuseImageSrc = (imageRef: ImageRef, mobile?: boolean) => {
  let id = imageRef._id
  if (preview) return `/portals-manager/api/images/${id}/data`
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/reuses/${slug}/images/${id}`
}

watch([reusesCatalogExists, reuseConfig], () => {
  const items: (LinkItem | BreadcrumbItem)[] = []
  if (reusesCatalogExists.value) { items.push({ type: 'standard', subtype: 'reuses' }) }
  items.push({ title: reuseConfig.value?.title || t('reuse') })
  setBreadcrumbs(items)
}, { immediate: true })

usePageSeo({
  title: () => (reuseConfig.value?.title || t('reuse')) + ' - ' + portalConfig.value.title,
  description: () => reuseConfig.value?.summary,
  ogImage: () => reuseConfig.value?.image ? getReuseImageSrc(reuseConfig.value.image) : undefined,
  ogType: 'article'
})

// Add JSON-LD for reuse
useJsonLd(() => {
  const config = reuseConfig.value
  if (!config) return []
  const base = useRequestURL()

  return createReuseSchema({
    id: `${base.origin}/reuses/${slug}`,
    title: config.title,
    description: config._descriptionHtml || config.description,
    url: base.href,
    dateModified: reuseFetch.data.value?.updatedAt,
    author: config.author ? { name: config.author } : undefined,
    basedOnDatasets: config.datasets?.map(d => ({
      id: `${base.origin}/datasets/${d.id}`,
      url: `${base.origin}/datasets/${d.id}`,
      name: d.title || d.id
    }))
  })
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
