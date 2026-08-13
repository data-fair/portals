<template>
  <h1
    v-if="page"
    class="d-sr-only"
  >
    {{ page.title }}
  </h1>

  <d-frame-wrapper
    v-if="page"
    :iframe-title="page.title"
    :src="page.href"
    class="fill-height"
    resize="no"
  />
</template>

<script setup lang="ts">

const route = useRoute()
const { portalConfig } = usePortalStore()
const page = computed(() => portalConfig.value.personal.accountPages.find(p => p.id === route.params.id))

useNavigationStore().clearBreadcrumbs()
useHead({ title: page.value?.title })
</script>
