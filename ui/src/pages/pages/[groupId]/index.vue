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

    <!-- Group not found -->
    <span
      v-else-if="group._id === 'unknown'"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('unknownGroup') }}
    </span>
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
    <v-row
      v-else
      class="d-flex align-stretch"
    >
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

    <!-- Actions -->
    <navigation-right>
      <pages-actions
        v-model:search="search"
        v-model:show-all="showAll"
        :group="group"
        @refresh-group="groupFetch.refresh()"
      />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')

const { t } = useI18n()
const route = useRoute<'/pages/[groupId]/'>()
const isBaseGroup = ['standard', 'event', 'news', 'default'].includes(route.params.groupId)

const pagesParams = computed(() => {
  const params: Record<string, any> = {
    size: 1000,
    sort: 'updated.date:-1',
    select: '_id,config.title,owner,group',
    groupId: route.params.groupId
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

const groupFetch = useFetch<{ _id: string, title: string, slug: string }>(
  $apiPath + '/groups/' + route.params.groupId,
  { immediate: !isBaseGroup }
)

const group = computed(() => {
  if (isBaseGroup) return { _id: route.params.groupId, title: t('groupTitle.' + route.params.groupId), slug: route.params.groupId }
  return groupFetch?.data.value || { _id: route.params.groupId, title: t('groupTitle.unknown'), slug: route.params.groupId }
})

watch(group, () => {
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: group.value?.title }
  ])
}, { immediate: isBaseGroup })
</script>

<i18n lang="yaml">
  en:
    pages: Pages
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages
      unknown: Unknown group
    noPagesCreated: You haven't created any page yet.
    noPagesDisplayed: No result matches your criteria.
    unknownGroup: Group not found

  fr:
    pages: Pages
    groupTitle:
      standard: Pages standard
      event: Événements
      news: Actualitées
      default: Autres pages
      unknown: Groupe inconnu
    noPagesCreated: Vous n'avez pas encore créé de page.
    noPagesDisplayed: Aucun résultat ne correspond à vos critères.
    unknownGroup: Groupe non trouvé

</i18n>
