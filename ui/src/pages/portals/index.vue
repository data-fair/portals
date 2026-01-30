<template>
  <v-container data-iframe-height>
    <!-- Skeleton loader-->
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

    <!-- No portals created -->
    <span
      v-else-if="!portalsFetch.data.value?.results.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noPortalsCreated') }}
    </span>
    <!-- No portals displayed (filters) -->
    <span
      v-else-if="!displayPortals.length"
      class="d-flex justify-center text-h6 mt-4"
    >
      {{ t('noPortalsDisplayed') }}
    </span>

    <!-- List of portals -->
    <template v-else>
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
            :show-owner="showAll || !!(portal.owner.department && !session.state.account.department)"
          />
        </v-col>
      </v-row>
    </template>

    <!-- Actions -->
    <navigation-right v-if="portalsFetch.data.value">
      <portals-actions
        v-model:search="search"
        v-model:show-all="showAll"
      />
    </navigation-right>
  </v-container>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal/index'
import NavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')
const search = useStringSearchParam('q')
const { t } = useI18n()

const portalsParams = computed(() => {
  const params: Record<string, any> = {
    size: 10000,
    sort: 'updatedAt:-1',
    select: '_id,config.title,config.description,config.authentication,ingress.url,owner'
  }
  if (showAll.value) params.showAll = true
  return params
})

const portalsFetch = useFetch<{ results: Portal[], count: number }>($apiPath + '/portals', { query: portalsParams })

const displayPortals = computed(() => {
  const portals = (portalsFetch.data.value?.results ?? [])
  if (!search.value) return portals
  return portals.filter(portal => portal.config.title.toLowerCase().includes(search.value.toLowerCase()))
})

watch(
  [() => portalsFetch.data.value?.count, () => displayPortals.value.length],
  ([count, displayed]) => {
    setBreadcrumbs([{ text: t('portalDisplayed', { count: count ?? 0, displayed }) }])
  },
  { immediate: true }
)

</script>

<i18n lang="yaml">
  en:
    noPortalsCreated: You haven't created any portals yet.
    noPortalsDisplayed: No results match the search criteria.
    portalDisplayed: No portals | {displayed}/{count} portal displayed | {displayed}/{count} portals displayed

  fr:
    noPortalsCreated: Vous n'avez pas encore créé de portail.
    noPortalsDisplayed: Aucun résultat ne correspond aux critères de recherche.
    portalDisplayed: Aucun portail | {displayed}/{count} portail affiché | {displayed}/{count} portails affichés

</i18n>
