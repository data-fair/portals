<template>
  <news-card
    v-if="newsPageConfig"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :page-config="newsPageConfig"
    :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.news.card"
    :is-portal-config="element.usePortalConfig || !element.cardConfig"
  />
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page-config'
import type { NewsCardElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: NewsCardElement }>()
const { portalConfig, preview } = usePortalStore()

let newsPageConfig: Ref<Omit<PageConfig, 'elements'> | null | undefined>
if (!preview) {
  const newsFetch = useFetch<PageConfig>(() => element.news?.slug ? '/portal/api/pages/news/' + element.news.slug : '', { immediate: false })
  newsPageConfig = newsFetch.data
  watch(() => element.news?.slug, (slug) => {
    if (slug) newsFetch.refresh()
  }, { immediate: true })
} else {
  newsPageConfig = ref({
    title: element.news?.title || 'Actualité 1',
    description: "Exemple d'actualité pour la prévisualisation.",
    newsMetadata: { slug: element.news?.slug || 'news-1', date: new Date().toISOString() }
  })
}
</script>
