<template>
  <!-- aria-label: the dialog is rendered in a teleport, its visible title is not enough to name it -->
  <v-dialog
    v-model="dialog"
    :aria-label="title"
    :fullscreen="$vuetify.display.smAndDown"
    max-width="1200"
  >
    <template #activator="{ props }">
      <action-btn
        v-bind="props"
        :action-style="actionStyle"
        :icon="icon"
        :resource-title="resourceTitle"
        :text="text"
        :tooltip="tooltip"
        :block="block"
        @click.prevent
      />
    </template>
    <template #default="{ isActive }">
      <v-card>
        <v-toolbar
          :title="title"
          density="compact"
          color="surface"
        >
          <template #append>
            <v-btn
              :icon="mdiClose"
              :title="t('close')"
              @click="isActive.value = false"
            />
          </template>
        </v-toolbar>
        <slot />
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiClose } from '@mdi/js'

const { trackDialog } = defineProps<{
  /** Dialog title */
  title?: string
  /** Button action style */
  actionStyle?: DatasetCard['actionsStyle']
  /** Button icon */
  icon: string
  /** Resource title */
  resourceTitle: string
  /** Short button label */
  text: string
  /** Longer descriptive text used for tooltip and aria-label */
  tooltip?: string
  /** Used to track a dialog open event */
  trackDialog?: { action: string, label: string }
  /** Whether the button should take the full width of its container */
  block?: boolean
}>()

const { t } = useI18n()

const dialog = ref(false)

if (trackDialog) {
  watch(dialog, (opened) => {
    if (opened) useAnalytics()?.track(trackDialog.action, { category: 'dialog', label: trackDialog.label })
  })
}
</script>

<i18n lang="yaml">
  en:
    close: Close
  fr:
    close: Fermer
</i18n>
