<!-- eslint-disable vue/no-v-html -->
<template>
  <component :is="detached ? VToolbar : VAppBar" :color="mergedOptions.color" :density="mergedOptions.density">
    {{ portalConfig.title }} - {{ home }}
  </component>
</template>

<script setup lang="ts">
import type { PortalConfig } from '../../../../api/types/portal'
import { VToolbar, VAppBar } from 'vuetify/components'

const { portalConfig, home } = defineProps({
  portalConfig: { type: Object as () => PortalConfig, required: true },
  home: { type: Boolean, default: false },
  detached: { type: Boolean, default: false }
})

const mergedOptions = computed(() => {
  if (!home) return portalConfig.appBar
  return { ...portalConfig.appBar, ...portalConfig.appBarHome }
})

</script>
