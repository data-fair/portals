<template>
  <div
    :class="[
      element.centered ? 'd-flex justify-center' : undefined,
      element.mb !== 0 && `mb-${element.mb ?? 4}`
    ]"
  >
    <v-autocomplete
      v-model="selectedResult"
      v-model:search="searchQuery"
      :items="results"
      :loading="loading"
      :label="t('searchLabel')"
      :density="element.density"
      :color="element.color"
      :base-color="element.color"
      :rounded="element.rounded"
      :variant="element.border ? 'outlined' : 'solo'"
      :max-width="!element.fullWidth ? '400' : undefined"
      :min-width="!element.fullWidth ? '250' : undefined"
      item-title="title"
      item-value="path"
      return-object
      autofocus
      clearable
      flat
      hide-details
      bg-color="surface"
      hide-no-data
      eager
      @update:model-value="onSelect"
    >
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps">
          <template #prepend>
            <v-icon :icon="resourceTypeIcon(item.raw.resourceType)" />
          </template>
          <template #subtitle>
            <span v-if="item.raw.summary">{{ item.raw.summary }}</span>
          </template>
        </v-list-item>
      </template>

      <template #append-inner>
        <v-icon :icon="mdiMagnify" />
      </template>
    </v-autocomplete>
  </div>
</template>

<script setup lang="ts">
import { mdiMagnify, mdiFileDocument, mdiFolder, mdiDatabase, mdiApps } from '@mdi/js'
import type { SearchElement } from '#api/types/page-elements/index.ts'

const { element } = defineProps<{
  element: SearchElement
  context: {
    isRoot: boolean
    index: number
    parentLength: number
  }
}>()

const { t } = useI18n()
const router = useRouter()
const { preview } = usePortalStore()
const portal = usePortal()

const searchEngineActive = computed(() => portal.value?.config?.searchEngine?.active)

const searchQuery = ref('')
const selectedResult = ref<any>(null)
const results = ref<any[]>([])
const loading = ref(false)

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const performSearch = async (query: string) => {
  if (!query || query.length < 2) {
    results.value = []
    return
  }

  loading.value = true
  try {
    const data = await $fetch('/api/search', {
      params: { q: query }
    })
    results.value = (data.results as any[]).map(hit => ({
      title: hit._source.title,
      summary: hit._source.description?.slice(0, 100),
      path: hit._source.path,
      resourceType: hit._source.resourceType
    }))
  } catch (e) {
    console.error('Search error:', e)
    results.value = []
  } finally {
    loading.value = false
  }
}

watch(searchQuery, (newQuery) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  if (!newQuery || newQuery.length < 2) {
    results.value = []
    return
  }
  debounceTimeout = setTimeout(() => {
    performSearch(newQuery)
  }, 300)
})

const onSelect = (result: any) => {
  if (!result || preview) return

  const baseUrl = portal.value?.ingress?.url || window.location.origin
  const url = result.path.startsWith('http') ? result.path : `${baseUrl}${result.path}`

  window.location.href = url
}

const resourceTypeIcon = (type?: string) => {
  switch (type) {
    case 'page': return mdiFileDocument
    case 'reuse': return mdiFolder
    case 'dataset': return mdiDatabase
    case 'application': return mdiApps
    default: return mdiMagnify
  }
}
</script>

<i18n lang="yaml">
en:
  searchLabel: Search...
  noResults: No results found

  fr:
  searchLabel: Rechercher...
  noResults: Aucun résultat trouvé
</i18n>
