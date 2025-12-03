<template>
  <!-- Undo last change -->
  <v-list-item
    :disabled="!changesStack.canUndo.value"
    @click="changesStack.undo()"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiUndo"
      />
    </template>
    {{ t('undoLastChange') }}
  </v-list-item>

  <!-- Redo last change -->
  <v-list-item
    :disabled="!changesStack.canRedo.value"
    @click="changesStack.redo()"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiRedo"
      />
    </template>
    {{ t('redoLastChange') }}
  </v-list-item>
</template>

<script setup lang="ts">
import { mdiUndo, mdiRedo } from '@mdi/js'
import type useChangesStack from '~/composables/use-changes-stack'

const { t } = useI18n()

defineProps<{
  changesStack: ReturnType<typeof useChangesStack>
}>()

</script>

<i18n lang="yaml">
  en:
    undoLastChange: Undo last change
    redoLastChange: Redo last change

  fr:
    undoLastChange: Annuler le dernier changement
    redoLastChange: Rétablir le dernier changement

</i18n>
