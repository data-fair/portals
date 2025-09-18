<template>
  <slot />
</template>

<script setup lang="ts">
import type { PortalConfig } from '#api/types/portal-config'

const { portalConfig } = defineProps<{
  portalConfig: PortalConfig
}>()

providePortalStore(portalConfig)

</script>
