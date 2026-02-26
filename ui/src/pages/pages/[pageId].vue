<template>
  <router-view />
</template>

<script setup lang="ts">
import { providePageStore } from '~/composables/use-page-store'
import { providePreviewPortal } from '~/composables/use-preview-portal'

const route = useRoute<'/pages/[pageId]'>()
const pageStore = providePageStore(route.params.pageId)
providePreviewPortal(pageStore)

provide('page-id', route.params.pageId)

</script>
