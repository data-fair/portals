<template>
  <v-card
    class="h-100"
    :to="`/pages/${group._id}/${page._id}`"
  >
    <v-card-item>
      <template #append>
        <owner-avatar
          v-if="showAll || !!(page.owner.department && !session.state.account.department)"
          :owner="page.owner"
        />
      </template>

      <template #title>
        <span class="font-weight-bold text-primary">
          {{ page.title }}
        </span>
        <v-tooltip
          v-if="page.title?.length > 20"
          activator="parent"
          location="top left"
          open-delay="300"
          :text="page.title"
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
import type { Page } from '#api/types/page'
import type { Group } from '#api/types/group'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')

defineProps<{
  page: Page
  group: Pick<Group, '_id' | 'title'> & Partial<Pick<Group, 'owner'>>
}>()
</script>
