<template>
  <!-- headless: registers the portal WebMCP host + base agent tools, renders nothing -->
</template>

<script setup lang="ts">
import type { $Fetch } from 'nitropack/types'
import type { PortalConfig } from '#api/types/portal-config'
import { toRef } from 'vue'
import { usePortalAgentHost } from '../composables/agent/use-portal-agent-host'

const props = defineProps<{
  portalConfig: PortalConfig
  portalId: string
  locale: string
  localFetch: $Fetch
}>()

// .client.vue → only mounted client-side, with a setup scope for onScopeDispose.
usePortalAgentHost({
  locale: toRef(() => props.locale),
  localFetch: props.localFetch,
  portalConfig: props.portalConfig,
  portalId: props.portalId
})
</script>
