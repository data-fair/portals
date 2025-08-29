<template>
  <v-container
    data-iframe-height
    style="min-height:500px"
  >
    <!-- Skeleton loader-->
    <v-row
      v-if="pagesFetch.loading.value"
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

    <!-- No pages created -->
    <span
      v-else-if="!pagesFetch.data.value?.results.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noPagesCreated') }}
    </span>
    <!-- No pages displayed (filters) -->
    <span
      v-else-if="!displayPages.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noPagesDisplayed') }}
    </span>

    <!-- List of pages -->
    <template v-else>
      <v-row class="d-flex align-stretch">
        <v-col
          v-for="page in displayPages"
          :key="page._id"
          md="4"
          sm="6"
          cols="12"
        >
          <page-card
            :page="page"
            :show-owner="showAll || !!(page.owner.department && !session.state.account.department)"
          />
        </v-col>
      </v-row>
    </template>

    <!-- Actions -->
    <navigation-right v-if="pagesFetch.data.value">
      <pages-actions
        v-model:search="search"
        v-model:show-all="showAll"
      />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')
const { t } = useI18n()

const pagesParams = computed(() => {
  const params: Record<string, any> = {
    size: 10000,
    sort: 'updated.date:-1',
    select: '_id,config.title,owner'
  }
  if (showAll.value) params.showAll = 'true'
  return params
})

const pagesFetch = useFetch<{ results: Page[], count: number }>($apiPath + '/pages', { query: pagesParams })

const displayPages = computed(() => {
  const pages = (pagesFetch.data.value?.results ?? [])
  if (!search.value) return pages
  return pages.filter(page => page.config.title.toLowerCase().includes(search.value.toLowerCase()))
})

watch(
  [() => pagesFetch.data.value?.count, () => displayPages.value.length],
  ([count, displayed]) => {
    setBreadcrumbs([{ text: t('pagesDisplayed', { count: count ?? 0, displayed }) }])
  },
  { immediate: true }
)

</script>

<i18n lang="yaml">
  en:
    pagesDisplayed: No pages | {displayed}/{count} page displayed | {displayed}/{count} pages displayed
    noPagesCreated: You haven't created any pages yet.
    noPagesDisplayed: No results match the search criteria.

  fr:
    pagesDisplayed: Aucune page | {displayed}/{count} page affichée | {displayed}/{count} pages affichées
    noPagesCreated: Vous n'avez pas encore créé de page.
    noPagesDisplayed: Aucun résultat ne correspond aux critères de recherche.

</i18n>

<!--
<style scoped>
</style>
-->
