<template>
  <ClientOnly>
    <v-alert
      v-if="owner && !canSee"
      type="info"
      variant="tonal"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
    >
      Cet assistant IA n'est pas disponible pour votre profil.
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
        :system-prompt="systemPrompt"
        :init-config-key="element.uuid"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import type { CustomAgentElement } from '#api/types/page-elements/index.ts'
import { type Account, getAccountRole } from '@data-fair/lib-common-types/session/index.js'
import { portalPromptContext } from '../../../composables/agent/portal-prompt-context'

const DfAgentChatBlock = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatBlock.vue'))

const { element } = defineProps<{ element: CustomAgentElement }>()
const { portal, portalConfig } = usePortalStore()
const owner = computed(() => portal.value.owner)

const session = useSession()

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

// The lib component carries no raw d-frame / URL / navigate logic — it resolves
// the chat URL and routes navigate-messages internally. We only compose the
// effective prompt: block prompt + portal context + focus datasets + containment.
const systemPrompt = computed(() => {
  const parts = [element.systemPrompt || '', ...portalPromptContext(portalConfig.value, owner.value?.name)]
  if (element.focusDatasets?.length) {
    const list = element.focusDatasets.map((d: { id: string, title?: string }) => `"${d.title ?? d.id}" (id: ${d.id})`).join(', ')
    parts.push(`Concentre tes explorations de données sur ces jeux de données : ${list}. Tu peux explorer le reste du catalogue uniquement si l'utilisateur le demande explicitement.`)
  }
  parts.push("Ton travail est limité au contexte de cette page. N'utilise pas l'outil de navigation pour quitter la page, sauf si l'utilisateur le demande explicitement.")
  return parts.join('\n')
})
</script>
