<template>
  <template v-if="agentChat?.active && owner">
    <template v-if="agentChat.type === 'drawer'">
      <DfAgentChatDrawer
        :account-type="owner.type"
        :account-id="owner.id"
        :chat-title="agentChat.chatTitle"
        :system-prompt="agentChat.systemPrompt"
        :drawer-props="agentChat.drawerProps"
      />
      <Teleport
        v-if="agentChat.togglePosition === 'appBar'"
        to="#agent-chat-appbar"
      >
        <DfAgentChatToggle :btn-props="agentChat.btnProps" />
      </Teleport>
      <div
        v-else
        style="position: fixed; bottom: 16px; right: 16px; z-index: 2500;"
      >
        <DfAgentChatToggle :btn-props="agentChat.btnProps" />
      </div>
    </template>

    <template v-else>
      <Teleport
        v-if="agentChat.togglePosition === 'appBar'"
        to="#agent-chat-appbar"
      >
        <DfAgentChatMenu
          :account-type="owner.type"
          :account-id="owner.id"
          :chat-title="agentChat.chatTitle"
          :system-prompt="agentChat.systemPrompt"
          :btn-props="agentChat.btnProps"
          :menu-props="agentChat.menuProps"
        />
      </Teleport>
      <div
        v-else
        style="position: fixed; bottom: 16px; right: 16px; z-index: 2500;"
      >
        <DfAgentChatMenu
          :account-type="owner.type"
          :account-id="owner.id"
          :chat-title="agentChat.chatTitle"
          :system-prompt="agentChat.systemPrompt"
          :btn-props="agentChat.btnProps"
          :menu-props="agentChat.menuProps"
        />
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import { defineAsyncComponent, effectScope, watchEffect, onScopeDispose, computed } from 'vue'
import type { Ref } from 'vue'
import type { $Fetch } from 'ofetch'
import type { PortalConfig } from '#api/types/portal-config'
import { useAgentDatasetTools } from '../composables/agent/dataset-tools'
import { useAgentDatasetDataTools } from '../composables/agent/dataset-data-tools'
import { useAgentNavigationTools } from '../composables/agent/navigation-tools'
import { useAgentGeoTools } from '../composables/agent/geo-tools'
import { useAgentPortalContentTools } from '../composables/agent/portal-content-tools'
import { useFrameServer } from '@data-fair/lib-vue-agents'

const DfAgentChatDrawer = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatDrawer.vue'))
const DfAgentChatToggle = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatToggle.vue'))
const DfAgentChatMenu = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatMenu.vue'))

const props = defineProps<{
  portalConfig: PortalConfig
  portalId: string
  owner: { type: string, id: string }
  locale: Ref<string>
  localFetch: $Fetch
}>()

const agentChat = computed(() => props.portalConfig.agentChat)
const owner = computed(() => props.owner)

let toolsScope: ReturnType<typeof effectScope> | null = null
watchEffect(() => {
  if (agentChat.value?.active && !toolsScope) {
    toolsScope = effectScope()
    toolsScope.run(() => {
      useFrameServer('portal')
      useAgentDatasetTools(props.locale, props.localFetch)
      useAgentDatasetDataTools(props.locale, props.localFetch)
      useAgentNavigationTools({
        locale: props.locale,
        portalConfig: props.portalConfig,
        navigationStore: useNavigationStore()
      })
      useAgentGeoTools(props.locale)
      useAgentPortalContentTools(props.locale, props.localFetch, props.portalId)
    })
  } else if (!agentChat.value?.active && toolsScope) {
    toolsScope.stop()
    toolsScope = null
  }
})
onScopeDispose(() => { toolsScope?.stop() })
</script>
