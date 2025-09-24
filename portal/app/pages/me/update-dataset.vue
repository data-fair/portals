<template>
  <d-frame :src="`/data-fair/next-ui/embed/workflow/update-dataset?publicationSite=data-fair-portals:${portal._id}&owner=${portalOwner}`"/>
</template>

<script setup lang="ts">

const { portal } = usePortalStore()
const portalOwner = computed(() => {
  let owner = `${portal.value.owner.type}:${portal.value.owner.id}`
  if (portal.value.owner.department) owner += `:${portal.value.owner.department}`
  return owner
})

</script>
