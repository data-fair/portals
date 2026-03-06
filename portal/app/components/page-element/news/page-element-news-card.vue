<template>
  <news-card
    v-if="newsPage"
    :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    :page="newsPage"
    :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.news.card"
    :is-portal-config="element.usePortalConfig || !element.cardConfig"
  />
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import type { NewsCardElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{ element: NewsCardElement }>()
const { portalConfig, preview } = usePortalStore()

let newsPage: Ref<Pick<Page, '_id' | 'type' | 'config' | 'updatedAt'> | null | undefined>
if (!preview) {
  const newsFetch = useFetch<Page>(() => element.news?.slug ? '/portal/api/pages/news/' + element.news.slug : '', { immediate: false })
  newsPage = newsFetch.data
  watch(() => element.news?.slug, (slug) => {
    if (slug) newsFetch.refresh()
  }, { immediate: true })
} else {
  newsPage = ref({
    _id: 'news-preview',
    type: 'news' as const,
    config: {
      title: element.news?.title || 'Actualité 1',
      description: "Exemple d'actualité pour la prévisualisation.",
      elements: [],
      newsMetadata: { slug: element.news?.slug || 'news-1', date: new Date().toISOString() }
    },
    updatedAt: new Date().toISOString()
  })
}
</script>
