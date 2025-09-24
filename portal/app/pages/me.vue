<template>
  <NuxtPage />
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth-required',
  layout: 'personal'
})
onMounted(() => {
  const route = useRoute()

  if (route.path === '/me') {
    const router = useRouter()
    router.replace('/me/account')
  }
})
</script>
