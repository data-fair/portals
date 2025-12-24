<template>
  <v-container data-iframe-height>
    <!-- Skeleton loader-->
    <v-row
      v-if="reusesFetch.loading.value"
      class="d-flex align-stretch"
    >
      <v-col
        v-for="i in 9"
        :key="i"
        md="4"
        sm="6"
        cols="12"
        class="d-flex"
      >
        <v-skeleton-loader
          :class="$vuetify.theme.current.dark ? 'w-100' : 'w-100 skeleton'"
          height="200"
          type="article"
        />
      </v-col>
    </v-row>

    <!-- No reuses created -->
    <span
      v-else-if="!reusesFetch.data.value?.results.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noReusesCreated') }}
    </span>
    <!-- No reuses displayed (filters) -->
    <span
      v-else-if="!displayReuses.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noReusesDisplayed') }}
    </span>

    <!-- List of reuses -->
    <v-row
      v-else
      class="d-flex align-stretch"
    >
      <v-col
        v-for="reuse in displayReuses"
        :key="reuse._id"
        md="4"
        sm="6"
        cols="12"
      >
        <reuse-card-ui :reuse="reuse" />
      </v-col>
    </v-row>

    <!-- Actions -->
    <navigation-right>
      <reuses-actions
        v-model:search="search"
        v-model:show-all="showAll"
      />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')
const { t } = useI18n()

const reusesParams = computed(() => {
  const params: Record<string, any> = {
    size: 1000,
    sort: 'updatedAt:-1',
    select: '_id,title'
  }
  if (showAll.value) params.showAll = 'true'
  return params
})

const reusesFetch = useFetch<{ results: Reuse[], count: number }>($apiPath + '/reuses', { query: reusesParams })
const displayReuses = computed(() => {
  const reuses = (reusesFetch.data.value?.results ?? [])
  if (!search.value) return reuses
  return reuses.filter(reuse => reuse.config.title.toLowerCase().includes(search.value.toLowerCase()))
})

watch(
  [() => reusesFetch.data.value?.count, () => displayReuses.value.length],
  ([count, displayed]) => {
    setBreadcrumbs([{ text: t('reusesDisplayed', { count: count ?? 0, displayed }) }])
  },
  { immediate: true }
)

</script>

<i18n lang="yaml">
  en:
    noReusesCreated: You haven't created any reuses yet.
    noReusesDisplayed: No results match the search criteria.
    reusesDisplayed: No reuses | {displayed}/{count} reuse displayed | {displayed}/{count} reuses displayed

  fr:
    noReusesCreated: Vous n'avez pas encore créé de réutilisation.
    noReusesDisplayed: Aucun résultat ne correspond aux critères de recherche.
    reusesDisplayed: Aucune réutilisation | {displayed}/{count} réutilisation affichée | {displayed}/{count} réutilisations affichées

</i18n>
