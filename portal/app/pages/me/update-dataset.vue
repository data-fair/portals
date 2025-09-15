<template>
  <d-frame :src="`/data-fair/next-ui/embed/workflow/update-dataset?publicationSite=data-fair-portals:${$portal._id}&owner=${portalOwner}`"/>
</template>

<script setup lang="ts">

definePageMeta({ layout: 'personal' })

const { $portal } = useNuxtApp()
const portalOwner = computed(() => {
  let owner = `${$portal.owner.type}:${$portal.owner.id}`
  if ($portal.owner.department) owner += `:${$portal.owner.department}`
  return owner
})

</script>
