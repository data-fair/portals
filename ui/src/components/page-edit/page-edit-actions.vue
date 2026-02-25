<template>
  <!-- Validate draft -->
  <v-list-item
    :loading="validateDraft.loading.value"
    :disabled="cancelDraft.loading.value || !hasDraftDiff"
    :title="t('validateDraft')"
    @click="validateDraft.execute()"
  >
    <template #prepend>
      <v-icon
        color="success"
        :icon="mdiFileReplace"
      />
    </template>
  </v-list-item>

  <!-- Cancel draft -->
  <v-menu
    v-model="showCancelDraftMenu"
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :loading="cancelDraft.loading.value"
        :disabled="validateDraft.loading.value || !hasDraftDiff"
        :title="t('cancelDraft')"
      >
        <template #prepend>
          <v-icon
            color="warning"
            :icon="mdiFileCancel"
          />
        </template>
      </v-list-item>
    </template>
    <template #default="{ isActive }">
      <v-card
        variant="elevated"
        :title="t('cancelingDraft')"
        :text="t('confirmCancelDraft')"
        :loading="cancelDraft.loading.value ? 'warning' : undefined"
      >
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="cancelDraft.loading.value"
            @click="isActive.value = false"
          >
            {{ t('no') }}
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="cancelDraft.loading.value"
            @click="cancelDraft.execute()"
          >
            {{ t('yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-menu>

  <!-- Portal preview selector -->
  <portal-preview-select class="mb-2" />

  <!-- View portal pages list -->
  <template
    v-for="portal in page?.portals"
    :key="portal"
  >
    <v-list-item
      :href="portalsById[portal]?.url + pageUrl"
      target="_blank"
      rel="noopener"
    >
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiOpenInNew"
        />
      </template>
      {{ t('viewOn', { portalTitle: portalsById[portal]?.title }) }}
    </v-list-item>
  </template>

  <!-- Undo / redo -->
  <div class="d-flex justify-center">
    <v-btn-group
      variant="tonal"
      color="primary"
      density="comfortable"
      class="mt-2 mx-2 w-100"
      divided
    >
      <v-btn
        :disabled="!changesStack.canUndo.value"
        :icon="mdiUndo"
        :title="t('undo')"
        class="flex-grow-1"
        @click="changesStack.undo()"
      />
      <v-btn
        :disabled="!changesStack.canRedo.value"
        :icon="mdiRedo"
        :title="t('redo')"
        class="flex-grow-1"
        @click="changesStack.redo()"
      />
    </v-btn-group>
  </div>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal/index.ts'
import { mdiFileReplace, mdiFileCancel, mdiUndo, mdiRedo, mdiOpenInNew } from '@mdi/js'

const { t } = useI18n()
const { pageId, page, pageFetch, hasDraftDiff, pageUrl } = usePageStore()
const { changesStack } = defineProps<{ changesStack: ReturnType<typeof useChangesStack> }>()
const showCancelDraftMenu = ref(false)

const validateDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}/draft`, { method: 'POST' })
  await pageFetch.refresh()
  changesStack.reset()
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}/draft`, { method: 'DELETE' })
  await pageFetch.refresh()
  changesStack.reset()
  showCancelDraftMenu.value = false
})

// For "View On" links
type PartialPortal = Pick<Portal, '_id' | 'title' | 'ingress'>
const portalsFetch = useFetch<{ results: PartialPortal[] }>($apiPath + '/portals', { query: { select: '_id,title,ingress', size: 10000 } })
const portalsById = computed(() => {
  const map: Record<string, { url: string; title: string }> = {}
  for (const portal of portalsFetch.data.value?.results || []) {
    map[portal._id] = {
      url: portal.ingress?.url || $uiConfig.portalUrlPattern.replace('{subdomain}', portal._id),
      title: portal.title
    }
  }
  return map
})

</script>

<i18n lang="yaml">
  en:
    cancelDraft: Cancel draft
    cancelingDraft: Canceling draft
    confirmCancelDraft: Are you sure you want to cancel the draft? All changes will be lost and cannot be recovered.
    validateDraft: Validate draft
    viewOn: View on {portalTitle}
    no: No
    yes: Yes
    undo: Undo last change
    redo: Redo last change
  fr:
    cancelDraft: Annuler le brouillon
    cancelingDraft: Annulation du brouillon
    confirmCancelDraft: Êtes-vous sûr de vouloir annuler le brouillon ? Tous les changements seront perdus et ne pourront pas être récupérés.
    validateDraft: Valider le brouillon
    viewOn: Voir sur {portalTitle}
    no: Non
    yes: Oui
    undo: Annuler le dernier changement
    redo: Rétablir le dernier changement
</i18n>
