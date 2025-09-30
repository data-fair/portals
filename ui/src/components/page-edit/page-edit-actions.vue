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
        color="primary"
        :icon="mdiFileReplace"
      />
    </template>
  </v-list-item>

  <!-- Cancel draft -->
  <v-list-item
    :loading="cancelDraft.loading.value"
    :disabled="validateDraft.loading.value || !hasDraftDiff"
    :title="t('cancelDraft')"
    @click="cancelDraft.execute()"
  >
    <template #prepend>
      <v-icon
        color="warning"
        :icon="mdiFileCancel"
      />
    </template>
  </v-list-item>

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
import { mdiFileReplace, mdiFileCancel, mdiUndo, mdiRedo } from '@mdi/js'

const { t } = useI18n()
const { pageFetch, hasDraftDiff } = usePageStore()
const { changesStack } = defineProps<{ changesStack: ReturnType<typeof useChangesStack> }>()

const validateDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageFetch.data.value?._id}/draft`, { method: 'POST' })
  await pageFetch.refresh()
  changesStack.reset()
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageFetch.data.value?._id}/draft`, { method: 'DELETE' })
  await pageFetch.refresh()
  changesStack.reset()
})

</script>

<i18n lang="yaml">
  en:
    validateDraft: Validate draft
    cancelDraft: Cancel draft
    undo: Undo
    redo: Redo
  fr:
    cancelDraft: Annuler le brouillon
    redo: Rétablir
    undo: Annuler
    validateDraft: Valider le brouillon
</i18n>
