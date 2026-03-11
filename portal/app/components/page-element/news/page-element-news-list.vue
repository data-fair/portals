<template>
  <v-row :class="['d-flex align-stretch', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-col
      v-for="newsPage in displayedNews"
      :key="newsPage.newsMetadata?.slug"
      :md="12 / element.columns"
      cols="12"
    >
      <news-card
        :page-config="newsPage"
        :card-config="(!element.usePortalConfig && element.cardConfig) ? element.cardConfig : portalConfig.news.card"
        :is-portal-config="element.usePortalConfig || !element.cardConfig"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { PageConfig } from '#api/types/page-config'
import type { NewsListElement } from '#api/types/page-elements/index.ts'

type NewsFetch = { count: number; results: Omit<PageConfig, 'elements'>[] }

const { element } = defineProps<{ element: NewsListElement }>()
const { portalConfig, preview } = usePortalStore()

let displayedNews: ComputedRef<NewsFetch['results']>

if (!preview) {
  const slugs = element.news?.map(n => n.slug) || []
  const newsQuery = computed(() => ({
    slugs: element.mode === 'custom' ? slugs.join(',') : undefined,
    size: element.mode !== 'custom' ? element.limit : undefined,
    sort: 'date:-1'
  }))

  const newsFetch = useFetch<NewsFetch>('/portal/api/news', { query: newsQuery })
  displayedNews = computed(() => {
    const results = newsFetch.data.value?.results || []
    if (element.mode === 'custom') return [...results].sort((a, b) => slugs.indexOf(a.newsMetadata?.slug ?? '') - slugs.indexOf(b.newsMetadata?.slug ?? ''))
    return results
  })
} else {
  displayedNews = computed(() => {
    return Array.from({ length: element.mode === 'custom' ? (element.news?.length || 1) : element.limit }, (_, i) => ({
      title: element.news?.[i]?.title || `Actualité ${i + 1}`,
      description: 'Exemple d\'actualité pour la prévisualisation.',
      newsMetadata: { slug: element.news?.[i]?.slug || `news-${i + 1}`, date: new Date().toISOString() }
    }))
  })
}
</script>
