<template>
  <df-navigation-right>
    <!-- Create new reuse -->
    <custom-router-link :to="`/reuses/new`">
      <v-list-item link>
        <template #prepend>
          <v-icon
            color="primary"
            :icon="mdiPlusCircle"
          />
        </template>
        {{ t('createNewReuse') }}
      </v-list-item>
    </custom-router-link>

    <!-- Notifications menu -->
    <v-menu
      v-if="eventsSubscribeUrl"
      v-model="showNotifMenu"
      :close-on-content-click="false"
      max-width="500"
    >
      <template #activator="{ props }">
        <v-list-item
          v-bind="props"
          rounded
        >
          <template #prepend>
            <v-icon
              color="primary"
              :icon="mdiBell"
            />
          </template>
          {{ t('notifications') }}
        </v-list-item>
      </template>
      <v-card
        :title="t('notifications')"
        rounded="lg"
      >
        <v-card-text class="pa-0">
          <d-frame-wrapper :src="eventsSubscribeUrl" />
        </v-card-text>
      </v-card>
    </v-menu>

    <!-- Search field -->
    <df-search-field
      v-model="search"
      class="mt-4"
    />

    <!-- Sort field -->
    <sort-field v-model="sort" />

    <!-- Show all switch (admin only) -->
    <v-switch
      v-if="session.user.value.adminMode"
      v-model="showAll"
      color="admin"
      class="mx-4 text-admin"
      :label="t('showAllReuses')"
    />
  </df-navigation-right>
</template>

<script setup lang="ts">
import { mdiPlusCircle, mdiBell } from '@mdi/js'
import dfSearchField from '@data-fair/lib-vuetify/search-field.vue'
import dfNavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const sort = defineModel('sort', { type: String, default: 'createdAt:-1' })
const showAll = defineModel('showAll', { type: Boolean, default: false })
const showNotifMenu = ref(false)

const eventsSubscribeUrl = computed(() => {
  const topics = [{ key: 'reuses:reuse-submit', title: t('reuseSubmittedForValidation') }]
  const urlTemplate = window.parent.location.origin + '/data-fair/reuses/{reuseId}'
  let sender = `${session.state.account.type}:${session.state.account.id}`
  if (session.state.account.department) sender += ':' + session.state.account.department
  else sender += ':*'
  return `/events/embed/subscribe?key=${encodeURIComponent(topics.map(t => t.key).join(','))}&title=${encodeURIComponent(topics.map(t => t.title).join(','))}&url-template=${encodeURIComponent(urlTemplate)}&sender=${encodeURIComponent(sender)}&register=false`
})

</script>

<i18n lang="yaml">
  en:
    createNewReuse: Create a new reuse
    showAllReuses: Show all reuses
    notifications: Notifications
    reuseSubmittedForValidation: A reuse has been submitted for validation

  fr:
    createNewReuse: Créer une nouvelle réutilisation
    showAllReuses: Voir toutes les réutilisations
    notifications: Notifications
    reuseSubmittedForValidation: Une réutilisation a été soumise pour validation

</i18n>
