<template>
  <router-view />
</template>

<script setup lang="ts">
import { providePageStore } from '~/composables/use-page-store'
const route = useRoute<'/pages/[id]'>()
providePageStore(route.params.id)

provide('page-id', route.params.id)
</script>
