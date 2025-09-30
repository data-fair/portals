<template>
  <v-card
    class="h-100"
    :to="`/pages/${group._id}`"
  >
    <v-card-item>
      <!-- Group title -->
      <template #title>
        <span class="font-weight-bold text-primary">
          {{ group.title }}
        </span>
        <v-tooltip
          v-if="group.title.length > 15"
          activator="parent"
          location="top left"
          open-delay="300"
          :text="group.title"
        />
      </template>

      <!-- Owner -->
      <template #append>
        <owner-avatar
          v-if="showOwner"
          :owner="group.owner"
        />
      </template>
    </v-card-item>

    <!-- Description -->
    <v-card-text>
      {{ group.description }}
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { Group } from '#api/types/group'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

defineProps<{
  showOwner: boolean
  group: Pick<Group, '_id' | 'title' | 'description'> & Partial<Pick<Group, 'owner'>>
}>()
</script>
