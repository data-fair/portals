<template>
  <!-- Create new portal -->
  <v-menu
    v-model="newPortalMenu"
    location="start"
    :close-on-content-click="false"
  >
    <template #activator="{props}">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon
            color="primary"
            :icon="mdiPlusCircle"
          />
        </template>
        {{ t('createNewPortal') }}
      </v-list-item>
    </template>
    <v-card
      data-iframe-height
      min-width="300"
      rounded="lg"
      :loading="createPortal.loading.value ? 'primary' : false"
    >
      <v-card-text class="pb-0">
        <v-text-field
          v-model="newPortalTitle"
          density="comfortable"
          variant="outlined"
          :label="t('newPortalTitle')"
          autofocus
          hide-details
        />
        <v-checkbox
          v-model="newPortalStaging"
          density="comfortable"
          :label="t('newPortalStaging')"
          hide-details
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="createPortal.loading.value"
          @click="newPortalMenu = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!newPortalTitle"
          :loading="createPortal.loading.value ? 'primary' : false"
          @click="createPortal.execute()"
        >
          {{ t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <!-- Search field -->
  <v-text-field
    v-model="search"
    :append-inner-icon="mdiMagnify"
    :label="t('search')"
    class="mt-4 mx-4"
    color="primary"
    density="compact"
    variant="outlined"
    autofocus
    hide-details
    clearable
  />

  <!-- Show all switch (admin only) -->
  <v-switch
    v-if="session.user.value.adminMode"
    v-model="showAll"
    color="admin"
    class="mx-4 text-admin"
    :label="t('showAllPortals')"
    hide-details
  />
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'
import { mdiMagnify, mdiPlusCircle } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const router = useRouter()

const search = defineModel('search', { type: String, default: '' })
const showAll = defineModel('showAll', { type: Boolean, default: false })

const newPortalMenu = ref(false)
const newPortalTitle = ref('')
const newPortalStaging = ref(false)
watch(newPortalMenu, () => {
  newPortalTitle.value = ''
  newPortalStaging.value = false
})

const createPortal = useAsyncAction(async () => {
  const portal = await $fetch<Portal>('/portals', {
    method: 'POST',
    body: {
      staging: newPortalStaging.value,
      config: { title: newPortalTitle.value }
    }
  })
  await router.push({ path: `/portals/${portal._id}` })
})

</script>

<i18n lang="yaml">
  en:
    cancel: Cancel
    create: Create
    createNewPortal: Create a new portal
    newPortalTitle: New Portal Title
    newPortalStaging: New Portal Staging
    search: Search
    showAllPortals: Show all portals

  fr:
    cancel: Annuler
    create: Créer
    createNewPortal: Créer un nouveau portail
    newPortalTitle: Titre du nouveau portail
    newPortalStaging: Portail de pré-production
    search: Rechercher
    showAllPortals: Voir tous les portails

</i18n>

<!--
<style scoped>
</style>
-->
