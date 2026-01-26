<template>
  <custom-router-link :to="`/reuses/${reuse._id}`">
    <v-card
      class="h-100"
      link
    >
      <v-card-item class="text-primary">
        <template #title>
          <span class="font-weight-bold">
            {{ reuse.title }}
          </span>
          <v-tooltip
            v-if="reuse.title?.length > 20"
            activator="parent"
            location="top left"
            open-delay="300"
            :text="reuse.title"
          />
        </template>

        <!-- Owner or Submitter -->
        <template #append>
          <owner-avatar
            v-if="showAll || !!(reuse.owner.department && !session.state.account.department)"
            :owner="reuse.owner"
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
        </v-list>
      </v-card-text>
    </v-card>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse/index'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')

const { reuse } = defineProps<{ reuse: Reuse }>()
</script>
