<template>
  <d-frame :src="`/processings/processings?owner=${portalOwner}`"/>
</template>

<script setup lang="ts">

definePageMeta({ layout: 'personal' })

const { $portal } = useNuxtApp()
const portalOwner = computed(() => {
  let owner = `${$portal.owner.type}:${$portal.owner.id}`
  if ($portal.owner.department) owner += `:${$portal.owner.department}`
  return owner
})

// TODO breadcrumbs

</script>
