<template>
  <v-btn
    :to="to"
    :icon="portalConfig.datasets.actionsStyle === 'icon' ? icon : undefined"
    :prepend-icon="portalConfig.datasets.actionsStyle === 'full' ? icon : undefined"
    :title="portalConfig.datasets.actionsStyle === 'icon' ? text : undefined"
    :text="portalConfig.datasets.actionsStyle !== 'icon' ? shortText || text : undefined"
    :density="portalConfig.datasets.actionsStyle === 'icon' ? 'comfortable' : undefined"
    :size="portalConfig.datasets.actionsStyle !== 'icon' ? 'small' : undefined"
    variant="text"
  />
</template>

<script setup lang="ts">

defineProps<{
  to?: string
  icon: string
  text: string
  shortText?: string
}>()

const { portalConfig } = usePortalStore()

</script>
