<template>
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
import { mdiUndo, mdiRedo } from '@mdi/js'

const { t } = useI18n()

defineProps<{ changesStack: ReturnType<typeof useChangesStack> }>()

</script>

<i18n lang="yaml">
  en:
    undo: Undo last change
    redo: Redo last change

  fr:
    undo: Annuler le dernier changement
    redo: Rétablir le dernier changement

</i18n>
