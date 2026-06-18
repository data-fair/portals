<template>
  <df-navigation-right>
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
    <df-search-field
      v-model="search"
      class="mt-4"
    />

    <!-- Sort field -->
    <sort-field
      v-model="sort"
      title-field="config.title"
    />

    <!-- Show all switch (admin only) -->
    <v-switch
      v-if="session.user.value.adminMode"
      v-model="showAll"
      color="admin"
      class="mx-4 text-admin"
      :label="t('showAllPortals')"
    />
  </df-navigation-right>
</template>

<script setup lang="ts">
import { mdiFormatFont, mdiPlusCircle } from '@mdi/js'
import dfSearchField from '@data-fair/lib-vuetify/search-field.vue'
import dfNavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'

const { t } = useI18n()
const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const sort = defineModel('sort', { type: String, default: 'createdAt:-1' })
const showAll = defineModel('showAll', { type: Boolean, default: false })

</script>

<i18n lang="yaml">
  en:
    createNewPortal: Create a new portal
    showAllPortals: Show all portals
    manageFontAssets: Manage fonts

  fr:
    createNewPortal: Créer un nouveau portail
    showAllPortals: Voir tous les portails
    manageFontAssets: Gérer les polices de caractères

</i18n>
