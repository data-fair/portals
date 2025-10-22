<template>
  <div :class="['d-flex justify-center', element.mb !== 0 && `mb-${element.mb ?? 4}`]">
    <v-text-field
      v-model="searchQuery"
      :label="t('searchLabel')"
      :density="element.density"
      :rounded="element.rounded"
      color="primary"
      base-color="primary"
      bg-color="surface"
      max-width="400"
      variant="outlined"
      autofocus
      hide-details
      @keyup.enter="onSearch"
    >
      <template #append>
        <v-btn
          color="primary"
          stacked
          :title="t('searchBtn')"
          :density="element.density"
          :rounded="element.rounded"
          :elevation="element.elevation"
          @click="onSearch"
        >
          <v-icon :icon="mdiMagnify" />
        </v-btn>
      </template>
    </v-text-field>
  </div>
</template>

<script setup lang="ts">
// import type { Search } from '#api/types/page-elements'
import { mdiMagnify } from '@mdi/js'

// TODO: replace with import from types when available
type Search = {
  type: 'search'
  density?: 'comfortable' | 'compact' | 'default'
  rounded?: boolean | string
  elevation?: number
  mb?: number
}

const { element } = defineProps<{ element: Search }>()

const { t } = useI18n()
const router = useRouter()

const searchQuery = ref('')

const onSearch = () => {
  if (searchQuery.value?.trim()) {
    router.push({
      path: '/datasets',
      query: { q: searchQuery.value.trim() }
    })
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
