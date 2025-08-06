<template>
  <v-container
    data-iframe-height
    style="min-height:500px"
  >
    <v-row>
      <v-col>
        <v-container
          fluid
          class="pa-0"
        >
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
          <template v-else>
            <v-list-subheader v-if="displayPages.length > 1">
              {{ displayPages.length }}/{{ pagesFetch.data.value?.count }} pages affichés
            </v-list-subheader>
            <v-list-subheader v-else>
              {{ displayPages.length }}/{{ pagesFetch.data.value?.count }} page affiché
            </v-list-subheader>
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
                  :show-owner="showAll || (page.owner.department && !session.state.account.department)"
                />
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-col>
      <navigation-right v-if="pagesFetch.data.value">
        <pages-actions
          v-model:search="search"
          v-model:show-all="showAll"
          :is-small="false"
        />
      </navigation-right>
    </v-row>
  </v-container>
</template>

<!--
<i18n lang="yaml">
</i18n>
-->

<script lang="ts" setup>
import type { Page } from '#api/types/page/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')

const session = useSessionAuthenticated()

const pagesParams = computed(() => {
  const params: Record<string, any> = {
    size: '10000',
    sort: 'updated.date:-1',
    select: '_id,config.title,owner'
  }
  if (showAll.value) {
    params.showAll = 'true'
  }
  return params
})

const pagesFetch = useFetch<{ results: Page[], count: number }>($apiPath + '/pages', { query: pagesParams })

const displayPages = computed(() => {
  const pages = (pagesFetch.data.value?.results ?? [])
  if (!search.value) return pages
  return pages.filter(page => page.config.title.toLowerCase().includes(search.value.toLowerCase()))
})

</script>
