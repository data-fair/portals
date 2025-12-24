<template>
  <v-container data-iframe-height>
    <!-- List of groups -->
    <v-row class="d-flex align-stretch">
      <v-col
        v-for="group in displayGroups"
        :key="group._id"
        md="4"
        sm="6"
        cols="12"
      >
        <group-card :group="group" />
      </v-col>

      <!-- Skeleton loaders for loading groups -->
      <template v-if="groupsFetch.loading.value">
        <v-col
          v-for="i in 5"
          :key="i"
          md="4"
          sm="6"
          cols="12"
        >
          <v-skeleton-loader
            :class="$vuetify.theme.current.dark ? 'w-100' : 'w-100 skeleton'"
            height="200"
            type="article"
          />
        </v-col>
      </template>
    </v-row>

    <!-- Actions -->
    <navigation-right>
      <groups-actions v-model:show-all="showAll" />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Group } from '#api/types/group'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const showAll = useBooleanSearchParam('showAll')

const groupsParams = computed(() => {
  const params: Record<string, any> = {
    size: 1000,
    sort: 'updatedAt:-1'
  }
  if (showAll.value) params.showAll = 'true'
  return params
})
const groupsFetch = useFetch<{ results: Group[], count: number }>($apiPath + '/groups', { query: groupsParams })

// Add base groups : standard (home, contact, privacy policy,... pages), event, news, default (generic pages without group)
const displayGroups = computed(() => {
  const groups: (Pick<Group, '_id' | 'title' | 'description'> & Partial<Pick<Group, 'owner'>>)[] = [
    { _id: 'standard', title: t('groupTitle.standard'), description: t('groupDesc.standard') },
    { _id: 'event', title: t('groupTitle.event'), description: t('groupDesc.event') },
    { _id: 'news', title: t('groupTitle.news'), description: t('groupDesc.news') },
    { _id: 'default', title: t('groupTitle.default'), description: t('groupDesc.default') }
  ]
  if (groupsFetch.data.value?.results.length) groups.push(...groupsFetch.data.value.results)
  return groups
})

setBreadcrumbs([{ text: t('pages') }])

</script>

<i18n lang="yaml">
  en:
    pages: Pages
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages
    groupDesc:
      standard: Home, contact, privacy policy pages, etc.
      event: Event pages
      news: News pages
      default: All ungrouped pages

  fr:
    pages: Pages
    groupTitle:
      standard: Pages standard
      event: Événements
      news: Actualités
      default: Autres pages
    groupDesc:
      standard: Pages d'accueil, de contact, de politique de confidentialité, etc.
      event: Pages d'événements
      news: Pages d'actualités
      default: Toutes les pages non groupées

</i18n>
