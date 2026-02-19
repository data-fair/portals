<template>
  <v-dialog
    v-model="dialog"
    max-width="1200"
    :fullscreen="$vuetify.display.smAndDown"
  >
    <template #activator="{ props }">
      <action-btn
        v-bind="props"
        :action-style="actionStyle"
        :icon="icon"
        :resource-title="resourceTitle"
        :text="text"
        :short-text="shortText"
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
  actionStyle: DatasetCard['actionsStyle']
  /** Button icon */
  icon: string
  /** Resource title */
  resourceTitle: string
  /** Button text */
  text: string
  /** Button short text */
  shortText?: string
  /** Used to track a dialog open event */
  trackDialog?: { action: string, label: string }
  /** Whether the button should take the full width of its container */
  block?: boolean
}>()

const dialog = ref(false)

if (trackDialog) {
  watch(dialog, (opened) => {
    if (opened) useAnalytics()?.track(trackDialog.action, { category: 'dialog', label: trackDialog.label })
  })
}
</script>
