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

    <!-- Portals filters -->
    <v-autocomplete
      v-model="portalsSelected"
      :items="portalsItems"
      item-title="display"
      item-value="portalId"
      :label="t('portal')"
      class="mt-4 mx-4"
      chips
      closable-chips
      multiple
    />

    <!-- Requested portals filters -->
    <v-autocomplete
      v-if="requestedPortalsItems.length"
      v-model="requestedPortalsSelected"
      :items="requestedPortalsItems"
      item-title="display"
      item-value="portalId"
      :label="t('requestedPortals')"
      class="mt-4 mx-4"
      chips
      closable-chips
      multiple
    />

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
import type { ReusesFacets } from '#api/doc/reuses/get-res'
import { mdiPlusCircle, mdiBell } from '@mdi/js'
import dfSearchField from '@data-fair/lib-vuetify/search-field.vue'
import dfNavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const sort = defineModel('sort', { type: String, default: 'createdAt:-1' })
const showAll = defineModel('showAll', { type: Boolean, default: false })
const portalsSelected = defineModel('portalsSelected', { type: Array, required: true })
const requestedPortalsSelected = defineModel('requestedPortalsSelected', { type: Array, required: true })
const showNotifMenu = ref(false)

const { facets } = defineProps<{
  facets: ReusesFacets
}>()

const portalsFetch = useFetch<{ results: Array<{ _id: string, title: string }> }>(
  $apiPath + '/portals',
  { query: { select: '_id,title', size: 10000 } }
)

const portalsFacetItems = (counts: Record<string, number>) => {
  if (!portalsFetch.data.value?.results) return []
  return Object.entries(counts)
    .map(([portalId, count]) => {
      const portal = portalsFetch.data.value?.results.find(p => p._id === portalId)
      return {
        display: `${portal?.title || portalId} (${count})`,
        portalId
      }
    })
    .sort((a, b) => a.display.localeCompare(b.display))
}
const portalsItems = computed(() => portalsFacetItems(facets.portals))
const requestedPortalsItems = computed(() => portalsFacetItems(facets.requestedPortals))

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
    portal: Portal
    requestedPortals: Requested publications
    notifications: Notifications
    reuseSubmittedForValidation: A reuse has been submitted for validation

  fr:
    createNewReuse: Créer une nouvelle réutilisation
    showAllReuses: Voir toutes les réutilisations
    portal: Portail
    requestedPortals: Publications demandées
    notifications: Notifications
    reuseSubmittedForValidation: Une réutilisation a été soumise pour validation

</i18n>
