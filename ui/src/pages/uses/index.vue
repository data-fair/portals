<template>
  <v-container
    data-iframe-height
    style="min-height:500px"
  >
    <!-- Skeleton loader-->
    <v-row
      v-if="usesFetch.loading.value"
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

    <!-- No uses created -->
    <span
      v-else-if="!usesFetch.data.value?.results.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noUsesCreated') }}
    </span>
    <!-- No uses displayed (filters) -->
    <span
      v-else-if="!displayUses.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noUsesDisplayed') }}
    </span>

    <!-- List of uses -->
    <template v-else>
      <v-row class="d-flex align-stretch">
        <v-col
          v-for="use in displayUses"
          :key="use._id"
          md="4"
          sm="6"
          cols="12"
        >
          <use-card
            :use="use"
            :show-owner="showAll || !!(use.owner.department && !session.state.account.department)"
          />
        </v-col>
      </v-row>
    </template>

    <!-- Actions -->
    <navigation-right v-if="usesFetch.data.value">
      <uses-actions
        v-model:search="search"
        v-model:show-all="showAll"
      />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Use } from '#api/types/use/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')
const { t } = useI18n()

const usesParams = computed(() => {
  const params: Record<string, any> = {
    size: 10000,
    sort: 'updated.date:-1',
    select: '_id,title,slug,config.title,config.author,config.summary,config.image,owner'
  }
  if (showAll.value) params.showAll = true
  return params
})

const usesFetch = useFetch<{ results: Use[], count: number }>($apiPath + '/uses', { query: usesParams })

const displayUses = computed(() => {
  const uses = (usesFetch.data.value?.results ?? [])
  if (!search.value) return uses
  return uses.filter(use => use.config.title.toLowerCase().includes(search.value.toLowerCase()))
})

watch(
  [() => usesFetch.data.value?.count, () => displayUses.value.length],
  ([count, displayed]) => {
    setBreadcrumbs([{ text: t('usesDisplayed', { count: count ?? 0, displayed }) }])
  },
  { immediate: true }
)

</script>

<i18n lang="yaml">
  en:
    noUsesCreated: You haven't created any uses yet.
    noUsesDisplayed: No results match the search criteria.
    usesDisplayed: No uses | {displayed}/{count} use displayed | {displayed}/{count} uses displayed

  fr:
    noUsesCreated: Vous n'avez pas encore créé de réutilisation.
    noUsesDisplayed: Aucun résultat ne correspond aux critères de recherche.
    usesDisplayed: Aucune réutilisation | {displayed}/{count} réutilisation affichée | {displayed}/{count} réutilisations affichées

</i18n>
