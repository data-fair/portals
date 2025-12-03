<template>
  <!-- Create new reuse -->
  <v-list-item :to="`/reuses/new`">
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiPlusCircle"
      />
    </template>
    {{ t('createNewReuse') }}
  </v-list-item>

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
    :label="t('showAllReuses')"
    hide-details
  />
</template>

<script setup lang="ts">
import { mdiMagnify, mdiPlusCircle } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const showAll = defineModel('showAll', { type: Boolean, default: false })

</script>

<i18n lang="yaml">
  en:
    createNewReuse: Create a new reuse
    search: Search
    showAllReuses: Show all reuses

  fr:
    createNewReuse: Créer une nouvelle réutilisation
    search: Rechercher
    showAllReuses: Voir toutes les réutilisations

</i18n>
