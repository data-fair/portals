<template>
  <d-frame-wrapper
    v-if="page"
    :iframe-title="page.title"
    :src="page.href"
    class="fill-height"
  />
</template>

<script setup lang="ts">

const route = useRoute()
const { portalConfig } = usePortalStore()
const page = computed(() => portalConfig.value.personal.accountPages.find(p => p.id === route.params.id))
useHead({ title: page.value?.title })
</script>
