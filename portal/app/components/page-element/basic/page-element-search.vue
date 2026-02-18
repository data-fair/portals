<template>
  <div
    :class="[
      element.centered ? 'd-flex justify-center' : undefined,
      element.mb !== 0 && `mb-${element.mb ?? 4}`
    ]"
  >
    <v-text-field
      v-model="searchQuery"
      :label="t('searchLabel')"
      :density="element.density"
      :rounded="element.btnPosition === 'attached' ? `e-0 s-${element.rounded}` : element.rounded"
      :color="element.color"
      :base-color="element.color"
      :variant="element.border ? 'outlined' : 'solo'"
      :max-width="!element.fullWidth ? '400' : undefined"
      :append-inner-icon="element.btnPosition === 'included' ? mdiMagnify : undefined"
      autofocus
      clearable
      flat
      hide-details
      bg-color="surface"
      @keyup.enter="onSearch"
      @click:append-inner="onSearch"
      @click:clear="search = ''"
    >
      <template
        v-if="element.btnPosition === 'attached' || element.btnPosition === 'spaced'"
        #append
      >
        <v-btn
          :color="element.color"
          :title="t('searchBtn')"
          :density="element.density"
          :rounded="element.btnPosition === 'attached' ? `s-0 e-${element.rounded}` : element.rounded"
          :elevation="element.btnPosition === 'spaced' ? element.elevation : 0"
          :class="element.btnPosition === 'spaced' ? 'ml-4 h-100' : 'h-100'"
          stacked
          @click="onSearch"
        >
          <v-icon :icon="mdiMagnify" />
        </v-btn>
      </template>
    </v-text-field>
  </div>
</template>

<script setup lang="ts">
import type { SearchElement } from '#api/types/page-elements/index.ts'
import { mdiMagnify } from '@mdi/js'

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
const route = useRoute()
const { preview } = usePortalStore()
const search = useStringSearchParam('q')

const searchQuery = ref(search.value || '')

const searchCategory = computed(() => {
  if (route.path.startsWith('/datasets')) return 'datasets'
  if (route.path.startsWith('/applications')) return 'applications'
  if (route.path.startsWith('/reuses')) return 'reuses'
  if (element.redirectPage) return 'datasets'
  return undefined
})

const onSearch = () => {
  if (!preview) {
    if (searchQuery.value) {
      const properties: Record<string, string> = { label: searchQuery.value }
      if (searchCategory.value) properties.category = searchCategory.value
      useAnalytics()?.track('search', properties)
    }
    if (element.redirectPage) {
      router.push({
        path: '/datasets',
        query: { q: searchQuery.value }
      })
    } else {
      search.value = searchQuery.value
    }
  }
}

</script>

<i18n lang="yaml">
  en:
    searchLabel: Search datasets
    searchBtn: Search

  fr:
    searchLabel: Saisissez votre recherche
    searchBtn: Rechercher
</i18n>

<style scoped>
/* Remove margin between input and appended button for attached button position */
:deep(.v-input--horizontal .v-input__append) {
  margin-inline-start: 0 !important;
}
</style>
