<template>
  <ClientOnly>
    <v-alert
      v-if="owner && !canSee"
      type="info"
      variant="tonal"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    >
      {{ t('notAvailable') }}
    </v-alert>
    <div
      v-else-if="owner"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
      :style="{ height: `${element.height ?? 500}px` }"
    >
      <DfAgentChatBlock
        :account-type="owner.type"
        :account-id="owner.id"
        :chat-title="element.title"
        :init-config-key="element.uuid"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import type { CustomAgentElement } from '#api/types/page-elements/index.ts'
import { type Account, getAccountRole } from '@data-fair/lib-common-types/session/index.js'

const DfAgentChatBlock = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatBlock.vue'))

const { element } = defineProps<{ element: CustomAgentElement }>()
const { portal } = usePortalStore()
const owner = computed(() => portal.value.owner)

const session = useSession()
const { t } = useI18n()

const viewerBucket = computed<'admin' | 'contrib' | 'user' | 'external' | 'anonymous'>(() => {
  if (!session.state.user) return 'anonymous'
  const role = getAccountRole(session.state, owner.value as Account, { acceptDepAsRoot: true }) as 'user' | 'contrib' | 'admin' | undefined
  return role ?? 'external'
})

const canSee = computed(() => {
  const visibleTo = element.visibleTo
  if (!visibleTo) return true
  return visibleTo.includes(viewerBucket.value)
})

// No system prompt: agents libs 0.7 ignore it, so the block's prompt and focus datasets are not
// applied (a persona is a configured agent, chosen by agentId: docs/architecture/agent.md). The
// portal's built-in guidance reaches the chat as host state (composables/agent/use-portal-agent-host.ts).
</script>

<i18n lang="yaml">
  en:
    notAvailable: This AI assistant is not available for your profile.
  fr:
    notAvailable: Cet assistant IA n'est pas disponible pour votre profil.
</i18n>
