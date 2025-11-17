<template>
  <d-frame-wrapper
    :iframe-title="t('contribute')"
    :src="`/data-fair/embed/workflow/update-dataset?publicationSite=data-fair-portals:${portal._id}&owner=${portalOwner}`"
    class="fill-height"
    resize="no"
  />
</template>

<script setup lang="ts">

const { t } = useI18n()
const { portal } = usePortalStore()
const portalOwner = computed(() => {
  let owner = `${portal.value.owner.type}:${portal.value.owner.id}`
  if (portal.value.owner.department) owner += `:${portal.value.owner.department}`
  return owner
})

useHead({ title: t('contribute') })
</script>

<i18n lang="yaml">
  en:
    contribute: Contribute
  fr:
    contribute: Contribuer
</i18n>
