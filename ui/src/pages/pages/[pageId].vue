<template>
  <router-view />
</template>

<script setup lang="ts">
import { providePageStore } from '~/composables/use-page-store'
const route = useRoute<'/pages/[pageId]'>()
providePageStore(route.params.pageId)

provide('page-id', route.params.pageId)

</script>
