<template>
  <template v-if="agentChat?.active && canSee && owner">
    <template v-if="agentChat.type === 'drawer'">
      <DfAgentChatDrawer
        :account-type="owner.type"
        :account-id="owner.id"
        :chat-title="agentChat.chatTitle"
        :system-prompt="systemPrompt"
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
          :system-prompt="systemPrompt"
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
          :system-prompt="systemPrompt"
          :btn-props="agentChat.btnProps"
          :menu-props="agentChat.menuProps"
        />
      </div>
    </template>
  </template>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import type { $Fetch } from 'nitropack/types'
import type { PortalConfig } from '#api/types/portal-config'
import { type Account, getAccountRole } from '@data-fair/lib-common-types/session/index.js'
import { portalPromptContext, navigateToFilteredViewHint } from '../composables/agent/portal-prompt-context'

const DfAgentChatDrawer = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatDrawer.vue'))
const DfAgentChatToggle = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatToggle.vue'))
const DfAgentChatMenu = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatMenu.vue'))

const props = defineProps<{
  portalConfig: PortalConfig
  portalId: string
  owner: Account
  locale: string
  localFetch: $Fetch
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

const systemPrompt = computed(() => {
  const base = agentChat.value?.systemPrompt || ''
  const parts = [base, ...portalPromptContext(props.portalConfig, props.owner.name)]
  parts.push(navigateToFilteredViewHint)
  return parts.join('\n')
})

</script>
