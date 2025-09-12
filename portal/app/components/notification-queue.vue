<template>
  <v-menu
    max-height="400"
    max-width="500"
    width="100%"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        title="Ouvrir la liste des notifications"
        stacked
        @click="fetchNotifications.refresh()"
      >
        <v-badge
          v-if="fetchNotifications.data.value?.countNew"
          :content="fetchNotifications.data.value.countNew"
          color="warning"
        >
          <v-icon :icon="mdiBell" />
        </v-badge>
        <v-icon v-else :icon="mdiBell" />
      </v-btn>
    </template>

    <v-list>
      <v-list-item v-if="!session.state.user">
        Vous devez vous <a href="https://koumoul.com">connecter</a> pour recevoir des notifications.
      </v-list-item>
      <v-list-item v-if="!fetchNotifications.data.value || !fetchNotifications.data.value.results.length">
        Vous n'avez pas encore reçu de notification.
      </v-list-item>
      <v-list-item
        v-for="notif in fetchNotifications.data.value?.results"
        v-else
        :key="notif._id"
        :href="notif.url"
        :title="notif.title"
        :subtitle="dayjs(notif.date).format('lll')"
        :value="notif.new"
        active-class="text-pink"
        lines="three"
      >
        <template v-if="notif.body" #subtitle>
          {{ notif.body }}
        </template>

        <template v-if="notif.sender" #prepend>
          <owner-avatar :owner="notif.sender" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import type { Emitter } from '@data-fair/lib-common-types/event'
import { mdiBell } from '@mdi/js'
import OwnerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'

const session = useSession()
const { dayjs } = useLocaleDayjs()

const fetchNotifications = useLocalFetch<{
  count: number
  countNew: number
  results: {
    _id: string
    title: string
    date: string
    body?: string
    url?: string
    new?: boolean
    sender?: Emitter
  }[]
}>('/events/api/notifications', { query: { size: 10 } })

</script>
