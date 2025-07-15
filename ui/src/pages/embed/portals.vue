<template>
  <v-container
    v-if="fetchPortals.data"
    data-iframe-height
  >
    {{ fetchPortals.data }}
  </v-container>
</template>

<i18n lang="yaml">
  fr:
    seeMore: "Voir plus"
  en:
    seeMore: "See more"
</i18n>

<script lang="ts" setup>
import type { Portal } from '#api/types/portal/index'

useSessionAuthenticated()

const search = useStringSearchParam('q')

const fetchPortals = useFetch<{ results: Portal[], count: number }>($apiPath + 'portals', { query: computed(() => ({ q: search.value })) })
</script>
