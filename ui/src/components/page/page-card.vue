<template>
  <v-card
    class="h-100"
    :to="`/pages/${page._id}`"
  >
    <v-card-item>
      <template #append>
        <owner-avatar
          v-if="showOwner"
          :owner="page.owner"
        />
      </template>

      <template #title>
        <span class="font-weight-bold text-primary">
          {{ page.config.title }}
        </span>
        <v-tooltip
          v-if="page.config.title.length > 15"
          activator="parent"
          location="top left"
          open-delay="300"
          :text="page.config.title"
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
import type { Page } from '~~/../api/types/page'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

defineProps({
  page: {
    type: Object as () => Page,
    default: null
  },
  showOwner: Boolean
})
</script>
