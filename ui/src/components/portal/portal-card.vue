<template>
  <v-card
    class="h-100"
    :to="`/portals/${portal._id}`"
  >
    <v-card-item>
      <template #append>
        <owner-avatar
          v-if="showOwner"
          :owner="portal.owner"
        />
      </template>

      <template #title>
        <span class="font-weight-bold text-primary">
          {{ portal.config.title }}
        </span>
        <v-tooltip
          v-if="portal.config.title.length > 15"
          activator="parent"
          location="top left"
          open-delay="300"
          :text="portal.config.title"
        />
      </template>
    </v-card-item>
    <v-divider />
    <v-card-text class="pa-0">
      <v-list
        density="compact"
        style="background-color: inherit;"
      >
        <!-- TODO -->
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { Portal } from '#api/types/portal'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

defineProps({
  portal: {
    type: Object as () => Portal,
    default: null
  },
  showOwner: Boolean
})
</script>
