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
  <portal-preview-select />

  <!-- Undo / redo -->
  <div class="d-flex justify-center">
    <v-btn-group
      variant="tonal"
      color="primary"
      density="comfortable"
      class="mt-4 mx-2 w-100"
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
import { mdiFileReplace, mdiFileCancel, mdiUndo, mdiRedo } from '@mdi/js'

const { t } = useI18n()
const { pageFetch, hasDraftDiff } = usePageStore()
const { changesStack } = defineProps<{ changesStack: ReturnType<typeof useChangesStack> }>()
const showCancelDraftMenu = ref(false)

const validateDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageFetch.data.value?._id}/draft`, { method: 'POST' })
  await pageFetch.refresh()
  changesStack.reset()
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageFetch.data.value?._id}/draft`, { method: 'DELETE' })
  await pageFetch.refresh()
  changesStack.reset()
  showCancelDraftMenu.value = false
})

</script>

<i18n lang="yaml">
  en:
    validateDraft: Validate draft
    cancelDraft: Cancel draft
    cancelingDraft: Canceling draft
    confirmCancelDraft: Are you sure you want to cancel the draft? All changes will be lost and cannot be recovered.
    no: No
    yes: Yes
    undo: Undo last change
    redo: Redo last change
  fr:
    validateDraft: Valider le brouillon
    cancelDraft: Annuler le brouillon
    cancelingDraft: Annulation du brouillon
    confirmCancelDraft: Êtes-vous sûr de vouloir annuler le brouillon ? Tous les changements seront perdus et ne pourront pas être récupérés.
    no: Non
    yes: Oui
    undo: Annuler le dernier changement
    redo: Rétablir le dernier changement
</i18n>
