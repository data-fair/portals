<template>
  <d-frame
    v-if="page"
    :src="page.href"
    :title="page.title"
    class="fill-height"
  />
</template>

<script setup lang="ts">

definePageMeta({ layout: 'personal' })

const route = useRoute()
const { $portalConfig } = useNuxtApp()
const page = computed(() => $portalConfig.personal.accountPages.find(p => p.id === route.params.id))

</script>
