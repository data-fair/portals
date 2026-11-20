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
        <DfAgentChatToggle :btn-props="btnProps" />
      </Teleport>
      <div
        v-else
        :style="`position: fixed; bottom: ${fabBottom}px; right: ${fabRight}px; z-index: 2500;`"
      >
        <DfAgentChatToggle :btn-props="btnProps" />
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
          :btn-props="btnProps"
          :menu-props="menuProps"
          :card-props="cardProps"
        />
      </Teleport>
      <div
        v-else
        :style="`position: fixed; bottom: ${fabBottom}px; right: ${fabRight}px; z-index: 2500;`"
      >
        <DfAgentChatMenu
          :account-type="owner.type"
          :account-id="owner.id"
          :chat-title="agentChat.chatTitle"
          :btn-props="btnProps"
          :menu-props="menuProps"
          :card-props="cardProps"
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

// same look and place as the scroll to top buttons (layout-scroll-to-top.vue here, scroll-to-top.vue of
// lib-vuetify in the embedded data-fair views), or a full height block of the app bar like the personal menu
const btnProps = computed(() => agentChat.value?.togglePosition === 'appBar'
  ? { rounded: 0, height: '100%', width: 72 }
  : { elevation: 1 })

// the menu opened from the app bar hangs from it, without the gap kept from a floating button
const menuProps = computed(() => agentChat.value?.togglePosition === 'appBar'
  ? { ...agentChat.value.menuProps, offset: 0 }
  : agentChat.value?.menuProps)

// the menu card is elevated like the other menus, without the border of the cards default
const cardProps = { border: 0 }

// the pages of the full layout embed a data-fair view whose own scroll to top button sits in the
// bottom right corner of the iframe, 24px away to clear its scrollbar: the agent goes above it in
// the same column, elsewhere the portal's own scroll to top button goes above the agent
const route = useRoute()
const isFullLayout = computed(() => route.meta.layout === 'full')
const fabRight = computed(() => isFullLayout.value ? 24 : 16)
const fabBottom = computed(() => isFullLayout.value ? 88 : 16)

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
