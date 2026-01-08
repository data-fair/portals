<template>
  <custom-router-link :to="`/pages/${group._id}`">
    <v-card
      class="h-100"
      link
    >
      <v-card-item class="text-primary">
        <!-- Group title -->
        <template #title>
          <span class="font-weight-bold">
            {{ group.title }}
          </span>
          <v-tooltip
            v-if="group.title.length > 20"
            activator="parent"
            location="top left"
            open-delay="300"
            :text="group.title"
          />
        </template>

        <!-- Owner -->
        <template #append>
          <owner-avatar
            v-if="showAll || !!(group.owner?.department && !session.state.account.department)"
            :owner="group.owner"
          />
        </template>
      </v-card-item>

      <!-- Description -->
      <v-card-text>
        {{ group.description }}
      </v-card-text>
    </v-card>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Group } from '#api/types/group'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')

defineProps<{
  group: Pick<Group, '_id' | 'title' | 'description'> & Partial<Pick<Group, 'owner'>>
}>()
</script>
