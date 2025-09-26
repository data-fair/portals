<template>
  <NuxtPage />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth-required',
  layout: 'personal'
})

const route = useRoute()
if (route.path === '/me') {
  const router = useRouter()
  router.replace('/me/account')
}

const { portalConfig } = usePortalStore()
useHead({
  titleTemplate: (title) => title ? `${title} - ${portalConfig.value.title}` : portalConfig.value.title
})
</script>
