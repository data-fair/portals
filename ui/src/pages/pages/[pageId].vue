<template>
  <router-view />
</template>

<script setup lang="ts">
import { providePageStore } from '~/composables/use-page-store'
import { providePreviewPortal } from '~/composables/use-preview-portal'
import { usePagePreviewWebMCP } from '~/composables/use-page-preview-webmcp'

const route = useRoute<'/pages/[pageId]'>()
const pageStore = providePageStore(route.params.pageId)
const { previewPortalId } = providePreviewPortal(pageStore)
// the agents' page preview for the back-office assistant, on every screen of the page
const { locale } = useI18n()
usePagePreviewWebMCP(route.params.pageId, pageStore.pageFetch.data, previewPortalId, locale)

provide('page-id', route.params.pageId)

</script>
