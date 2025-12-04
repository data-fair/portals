<template>
  <v-card
    :to="`/reuses/${reuse._id}`"
    class="h-100"
  >
    <v-card-item>
      <template #append>
        <owner-avatar
          v-if="showAll || !!(reuse.owner.department && !session.state.account.department)"
          :owner="reuse.owner"
        />
      </template>

      <template #title>
        <span class="font-weight-bold text-primary">
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
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse/index'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')

const { reuse } = defineProps<{ reuse: Reuse }>()
</script>
