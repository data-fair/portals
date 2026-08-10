<template>
  <!-- Wrapper carries the disabled cursor + native title: a disabled v-select
       has pointer-events:none, so the hover lands on this div instead. -->
  <div
    :style="disabled ? { cursor: 'not-allowed' } : undefined"
    :title="disabled ? t('sortDisabledRelevance') : undefined"
  >
    <v-select
      :model-value="sort"
      :items="items"
      :label="t('sortBy')"
      :density="density"
      :rounded="rounded"
      :disabled="disabled"
      variant="outlined"
      hide-details
      clearable
      @update:model-value="$emit('update:sort', $event)"
      @click:clear="$emit('update:order', undefined)"
    >
      <template
        v-if="!drawer"
        #append
      >
        <v-btn-toggle
          :model-value="order"
          :density="density"
          :rounded="rounded"
          :disabled="disabled"
          variant="outlined"
          class="h-100"
          divided
          mandatory
          @update:model-value="onOrderChange"
        >
          <v-btn
            value="-1"
            :icon="mdiSortDescending"
            :title="t('descending')"
            stacked
          />
          <v-btn
            value="1"
            :icon="mdiSortAscending"
            :title="t('ascending')"
            stacked
          />
        </v-btn-toggle>
      </template>
    </v-select>

    <v-btn-toggle
      v-if="drawer"
      :model-value="order"
      :density="density"
      :rounded="rounded"
      :disabled="disabled"
      variant="outlined"
      class="w-100 mt-6"
      divided
      mandatory
      @update:model-value="onOrderChange"
    >
      <v-btn
        value="-1"
        :icon="mdiSortDescending"
        :title="t('descending')"
        class="flex-grow-1"
      />
      <v-btn
        value="1"
        :icon="mdiSortAscending"
        :title="t('ascending')"
        class="flex-grow-1"
      />
    </v-btn-toggle>
  </div>
</template>

<script setup lang="ts">
import { mdiSortAscending, mdiSortDescending } from '@mdi/js'

defineProps<{
  sort?: string
  order?: string
  items: unknown[]
  density?: 'default' | 'comfortable' | 'compact'
  rounded?: string | number | boolean
  drawer?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:sort': [value: string]
  'update:order': [value: '-1' | '1' | undefined]
}>()

const onOrderChange = (val: string) => emit('update:order', val as '-1' | '1')
const { t } = useI18n({ useScope: 'local' })

</script>

<i18n lang="yaml">
en:
  sortBy: Sort by
  ascending: Ascending order
  descending: Descending order
  sortDisabledRelevance: 'Sorting is disabled during a search: results are sorted by relevance'
fr:
  sortBy: Trier par
  ascending: Ordre croissant
  descending: Ordre décroissant
  sortDisabledRelevance: 'Tri désactivé pendant une recherche : les résultats sont triés par pertinence'
</i18n>
