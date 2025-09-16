<template>
  <v-menu
    max-height="400"
    max-width="500"
    width="100%"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-btn
        v-bind="detached ? undefined : props"
        :title="t('openNotificationList')"
        stacked
        @click="fetchNotifications?.refresh()"
      >
        <v-badge
          :model-value="!!fetchNotifications?.data.value?.countNew || detached"
          :content="detached ? 3 : fetchNotifications?.data.value?.countNew"
          color="warning"
        >
          <v-icon :icon="mdiBell" />
        </v-badge>
      </v-btn>
    </template>

    <v-list>
      <v-list-item v-if="!session.user.value">
        {{ t('loginRequired.part1') }} <a :href="session.loginUrl()">{{ t('loginRequired.part2') }}</a> {{ t('loginRequired.part3') }}
      </v-list-item>
      <v-list-item v-else-if="!fetchNotifications?.data.value || !fetchNotifications.data.value.results.length">
        {{ t('noNotifications') }}
      </v-list-item>
      <v-list-item
        v-for="notif in fetchNotifications?.data.value?.results"
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
const { t } = useI18n()

const { detached } = defineProps({
  detached: { type: Boolean, default: false }
})

type Notification = {
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
}

let fetchNotifications: ReturnType<typeof useLocalFetch<Notification>> | undefined

if (!detached && session.user.value) {
  fetchNotifications = useLocalFetch<Notification>('/events/api/notifications', { query: { size: 10 } })
}

</script>

<i18n lang="yaml">
  en:
    openNotificationList: Open notification list
    noNotifications: You have not received any notifications yet.
    loginRequired:
      part1: You must
      part2: log in
      part3: to receive notifications.
  fr:
    openNotificationList: Ouvrir la liste des notifications
    noNotifications: Vous n'avez pas encore reçu de notification.
    loginRequired:
      part1: Vous devez vous
      part2: connecter
      part3: pour recevoir des notifications.
</i18n>
