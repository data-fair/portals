<template>
  <v-container v-if="pageConfigFetch.data.value">
  HELLO {{ pageConfigFetch.data }}
  <page-elements :model-value="pageConfigFetch.data.value.elements" />
  </v-container>
</template>

<script setup lang="ts">
import type { PageConfig } from '~~/../api/types/page'

const route = useRoute()
const pageConfigFetch = await useFetch<PageConfig>('/portal/api/pages/' + route.params.slug, { watch: false })
</script>
