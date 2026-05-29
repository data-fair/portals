<template>
  <ClientOnly>
    <div
      v-if="owner"
      :class="element.mb !== 0 && `mb-${element.mb ?? 4}`"
      :style="{ height: `${element.height ?? 500}px` }"
    >
      <DfAgentChatBlock
        :account-type="owner.type"
        :account-id="owner.id"
        :chat-title="element.title"
        :system-prompt="systemPrompt"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue'
import type { CustomAgent } from '#api/types/page-elements/index.ts'
import { portalPromptContext } from '../../../composables/agent/portal-prompt-context'

const DfAgentChatBlock = defineAsyncComponent(() => import('@data-fair/lib-vuetify-agents/DfAgentChatBlock.vue'))

const { element } = defineProps<{ element: CustomAgent }>()
const { portal, portalConfig } = usePortalStore()
const owner = computed(() => portal.value.owner)

// The lib component carries no raw d-frame / URL / navigate logic — it resolves
// the chat URL and routes navigate-messages internally. We only compose the
// effective prompt: block prompt + portal context + focus datasets + containment.
const systemPrompt = computed(() => {
  const parts = [element.systemPrompt || '', ...portalPromptContext(portalConfig.value, owner.value?.name)]
  if (element.focusDatasets?.length) {
    const list = element.focusDatasets.map(d => `"${d.title ?? d.id}" (id: ${d.id})`).join(', ')
    parts.push(`Concentre tes explorations de données sur ces jeux de données : ${list}. Tu peux explorer le reste du catalogue uniquement si l'utilisateur le demande explicitement.`)
  }
  parts.push("Ton travail est limité au contexte de cette page. N'utilise pas l'outil de navigation pour quitter la page, sauf si l'utilisateur le demande explicitement.")
  return parts.join('\n')
})
</script>
