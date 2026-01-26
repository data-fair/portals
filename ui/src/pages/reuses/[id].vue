<template>
  <router-view />
</template>

<script setup lang="ts">
import { provideReuseStore } from '~/composables/use-reuse-store'
const route = useRoute<'/reuses/[id]'>()

provideReuseStore(route.params.id)
provideImageSrc('reuse', route.params.id)

</script>
