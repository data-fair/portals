<template>
  <v-tooltip
    :disabled="!disabled"
    :text="t('sortDisabledRelevance')"
    location="bottom"
  >
    <template #activator="{ props: tooltipProps }">
      <div
        v-bind="tooltipProps"
        :class="{ 'cursor-not-allowed': disabled }"
      >
        <v-select
          v-model="sort"
          :label="t('sort')"
          :items="sortItems"
          :clearable="false"
          :disabled="disabled"
          class="mt-4 mx-4"
          rounded="md"
        />
      </div>
    </template>
  </v-tooltip>
</template>

<script setup lang="ts">
const { t } = useI18n()

const sort = defineModel({ type: String, default: 'createdAt:-1' })

const { titleField = 'title', disabled } = defineProps<{
  titleField?: string
  disabled?: boolean
}>()

const sortItems = computed(() => [
  { title: t('sortCreatedAtDesc'), value: 'createdAt:-1' },
  { title: t('sortCreatedAtAsc'), value: 'createdAt:1' },
  { title: t('sortUpdatedAtDesc'), value: 'updatedAt:-1' },
  { title: t('sortUpdatedAtAsc'), value: 'updatedAt:1' },
  { title: t('sortTitleAsc'), value: `${titleField}:1` },
  { title: t('sortTitleDesc'), value: `${titleField}:-1` },
])
</script>

<i18n lang="yaml">
  en:
    sort: Sort by
    sortDisabledRelevance: "Sorting is disabled during a search: results are sorted by relevance"
    sortCreatedAtDesc: Creation (newest)
    sortCreatedAtAsc: Creation (oldest)
    sortUpdatedAtDesc: Update (newest)
    sortUpdatedAtAsc: Update (oldest)
    sortTitleAsc: Title (A → Z)
    sortTitleDesc: Title (Z → A)

  fr:
    sort: Trier par
    sortDisabledRelevance: "Le tri est désactivé pendant une recherche : les résultats sont triés par pertinence"
    sortCreatedAtDesc: Création (plus récent)
    sortCreatedAtAsc: Création (plus ancien)
    sortUpdatedAtDesc: Mise à jour (plus récente)
    sortUpdatedAtAsc: Mise à jour (plus ancienne)
    sortTitleAsc: Titre (A → Z)
    sortTitleDesc: Titre (Z → A)
</i18n>
