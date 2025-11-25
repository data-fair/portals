<template>
  <v-dialog v-model="dialog" max-width="1200">
    <template #activator="{ props }">
      <action-btn
        v-bind="props"
        :action-style="actionStyle"
        :icon="icon"
        :text="text"
        :short-text="shortText"
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

defineProps<{
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
}>()

const dialog = defineModel('dialog', { type: Boolean })

</script>
