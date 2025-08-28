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
            v-if="portalsFetch.loading.value"
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
            <v-list-subheader v-if="displayPortals.length > 1">
              {{ displayPortals.length }}/{{ portalsFetch.data.value?.count }} pages affichés
            </v-list-subheader>
            <v-list-subheader v-else>
              {{ displayPortals.length }}/{{ portalsFetch.data.value?.count }} page affiché
            </v-list-subheader>
            <v-row class="d-flex align-stretch">
              <v-col
                v-for="portal in displayPortals"
                :key="portal._id"
                md="4"
                sm="6"
                cols="12"
              >
                <portal-card
                  :portal="portal"
                  :show-owner="showAll || (portal.owner.department && !session.state.account.department)"
                />
              </v-col>
            </v-row>
          </template>
        </v-container>
      </v-col>
      <navigation-right v-if="portalsFetch.data.value">
        <portals-actions
          v-model:search="search"
          v-model:show-all="showAll"
          :is-small="false"
        />
      </navigation-right>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')

const session = useSessionAuthenticated()

const portalsParams = computed(() => {
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

const portalsFetch = useFetch<{ results: Portal[], count: number }>($apiPath + '/portals', { query: portalsParams })

const displayPortals = computed(() => {
  const portals = (portalsFetch.data.value?.results ?? [])
  if (!search.value) return portals
  return portals.filter(portal => portal.config.title.toLowerCase().includes(search.value.toLowerCase()))
})

</script>

<!--
<i18n lang="yaml">
</i18n>
-->

<!--
<style scoped>
</style>
-->
