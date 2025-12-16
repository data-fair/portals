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
          <v-spacer />
          <v-btn
            :icon="mdiClose"
            @click="isActive.value = false"
          />
        </v-toolbar>
        <slot />
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import type { DatasetCard } from '#api/types/portal/index.js'
import { mdiClose } from '@mdi/js'

const { trackPath } = defineProps<{
  /** Dialog title */
  title?: string
  /** Button action style */
  actionStyle: DatasetCard['actionsStyle']
  /** Button icon */
  icon: string
  /** Button text */
  text: string
  /** Button short text */
  shortText?: string
  /** Used to track a page view when this dialog is opened */
  trackPath?: string
  /** Whether the button should take the full width of its container */
  block?: boolean
}>()

const dialog = ref(false)

if (trackPath) {
  watch(dialog, () => {
    useAnalytics()?.page({ title: trackPath })
  })
}
</script>
