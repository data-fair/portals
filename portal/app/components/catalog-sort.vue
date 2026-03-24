<template>
  <v-select
    :model-value="sort"
    :items="items"
    :label="t('sortBy')"
    :density="density"
    :rounded="rounded"
    variant="outlined"
    hide-details
    clearable
    @update:model-value="$emit('update:sort', $event)"
    @click:clear="$emit('update:order', undefined)"
  >
    <template v-if="!drawer" #append>
      <v-btn-toggle
        :model-value="order"
        :density="density"
        :rounded="rounded"
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
fr:
  sortBy: Trier par
  ascending: Ordre croissant
  descending: Ordre décroissant
</i18n>
