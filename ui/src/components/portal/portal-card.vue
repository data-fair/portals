<template>
  <custom-router-link :to="`/portals/${portal._id}`">
    <v-card
      class="h-100"
      link
    >
      <v-card-item class="text-primary">
        <template #title>
          <span class="font-weight-bold">
            {{ portal.config.title }}
          </span>
          <v-tooltip
            v-if="portal.config.title.length > 20"
            activator="parent"
            location="top left"
            open-delay="300"
            :text="portal.config.title"
          />
        </template>

        <!-- Owner -->
        <template #append>
          <owner-avatar
            v-if="showOwner"
            :owner="portal.owner"
          />
        </template>
      </v-card-item>
      <v-divider />
      <v-card-text class="pa-0">
        <v-list
          density="compact"
          style="background-color: inherit;"
        >
          <!-- TODO: Add a content -->
          {{ portal.config.description }}
        </v-list>
      </v-card-text>
    </v-card>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

defineProps({
  portal: {
    type: Object as () => Portal,
    default: null
  },
  showOwner: Boolean
})
</script>
