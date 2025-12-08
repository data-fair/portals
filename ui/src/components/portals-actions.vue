<template>
  <!-- Create new portal -->
  <custom-router-link :to="'/portals/new'">
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiPlusCircle"
        />
      </template>
      {{ t('createNewPortal') }}
    </v-list-item>
  </custom-router-link>

  <!-- Manage fonts -->
  <custom-router-link :to="'/portals/font-assets'">
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiFormatFont"
        />
      </template>
      {{ t('manageFontAssets') }}
    </v-list-item>
  </custom-router-link>

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
import { mdiFormatFont, mdiMagnify, mdiPlusCircle } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const showAll = defineModel('showAll', { type: Boolean, default: false })

</script>

<i18n lang="yaml">
  en:
    createNewPortal: Create a new portal
    search: Search
    showAllPortals: Show all portals
    manageFontAssets: Manage fonts

  fr:
    createNewPortal: Créer un nouveau portail
    search: Rechercher
    showAllPortals: Voir tous les portails
    manageFontAssets: Gérer les polices de caractères

</i18n>
