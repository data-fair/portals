<template>
  <template v-if="agentChat?.active && canSee && owner">
    <template v-if="agentChat.type === 'drawer'">
      <DfAgentChatDrawer
        :account-type="owner.type"
        :account-id="owner.id"
        :chat-title="agentChat.chatTitle"
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
          :btn-props="agentChat.btnProps"
          :menu-props="agentChat.menuProps"
        />
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import type { PortalConfig } from '#api/types/portal-config'
import { type Account, getAccountRole } from '@data-fair/lib-common-types/session/index.js'

const DfAgentChatDrawer = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatDrawer.vue'))
const DfAgentChatToggle = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatToggle.vue'))
const DfAgentChatMenu = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatMenu.vue'))

const props = defineProps<{
  portalConfig: PortalConfig
  portalId: string
  owner: Account
  locale: string
}>()

const agentChat = computed(() => props.portalConfig.agentChat)
const owner = computed(() => props.owner)

const session = useSession()

const viewerBucket = computed<'admin' | 'contrib' | 'user' | 'external' | 'anonymous'>(() => {
  if (!session.state.user) return 'anonymous'
  const role = getAccountRole(session.state, props.owner, { acceptDepAsRoot: true }) as 'user' | 'contrib' | 'admin' | undefined
  return role ?? 'external'
})

const canSee = computed(() => {
  const visibleTo = agentChat.value?.visibleTo
  if (!visibleTo) return true
  return visibleTo.includes(viewerBucket.value)
})

// No system prompt: agents libs 0.7 ignore it (a persona is a configured agent, chosen by
// agentId — agentChat.systemPrompt is not applied, docs/architecture/agent.md). The portal's
// built-in guidance reaches the chat as host state (composables/agent/use-portal-agent-host.ts).

</script>
