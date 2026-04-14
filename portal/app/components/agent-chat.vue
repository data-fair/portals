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
import { type Account, getAccountRole } from '@data-fair/lib-common-types/session/index.js'

const DfAgentChatDrawer = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatDrawer.vue'))
const DfAgentChatToggle = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatToggle.vue'))
const DfAgentChatMenu = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatMenu.vue'))

const props = defineProps<{
  portalConfig: PortalConfig
  portalId: string
  owner: Account
  locale: Ref<string>
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
  const domain = import.meta.client ? window.location.hostname : ''
  const parts = [base]
  if (domain) parts.push(`Le nom de domaine de ce portail est "${domain}".`)
  if (props.owner.name) parts.push(`Ce portail est géré par "${props.owner.name}".`)
  if (props.portalConfig.title) parts.push(`Le titre de ce portail est "${props.portalConfig.title}".`)
  parts.push('Quand tu effectues une recherche ou un filtrage de données dans un jeu de données, propose systématiquement à l\'utilisateur de naviguer vers une vue filtrée. Le sous-agent dataset_data inclut dans sa section Context un champ filterQuery (query string URL) et un champ columns (colonnes pertinentes). Utilise l\'outil navigate avec la filterQuery comme paramètre query en y ajoutant select=col1,col2,col3 à partir des clés de columns. Propose la vue tableau /datasets/{datasetId}/table, et si les données sont géolocalisées (présence de bbox, geo_distance dans la filterQuery, ou colonnes géographiques dans columns) propose également la vue carte /datasets/{datasetId}/map.')
  return parts.join('\n')
})

let toolsScope: ReturnType<typeof effectScope> | null = null
watchEffect(() => {
  if (agentChat.value?.active && canSee.value && !toolsScope) {
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
  } else if ((!agentChat.value?.active || !canSee.value) && toolsScope) {
    toolsScope.stop()
    toolsScope = null
  }
})
onScopeDispose(() => { toolsScope?.stop() })
</script>
