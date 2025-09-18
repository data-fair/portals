<template>
  <v-menu
    v-model="newPageMenu"
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
        {{ t('createNewPage') }}
      </v-list-item>
    </template>
    <v-card
      data-iframe-height
      min-width="300"
      rounded="lg"
      :loading="createPage.loading.value ? 'primary' : false"
    >
      <v-card-text>
        <v-text-field
          v-model="newPageTitle"
          variant="outlined"
          density="comfortable"
          :label="t('newPageTitle')"
          autofocus
          hide-details
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="createPage.loading.value"
          @click="newPageMenu = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!newPageTitle"
          :loading="createPage.loading.value ? 'primary' : false"
          @click="createPage.execute()"
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
    :label="t('showAllPages')"
    hide-details
  />
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import { mdiMagnify, mdiPlusCircle } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const router = useRouter()

const search = defineModel('search', { type: String, default: '' })
const showAll = defineModel('showAll', { type: Boolean, default: false })

const newPageMenu = ref(false)
const newPageTitle = ref('')
watch(newPageMenu, () => { newPageTitle.value = '' })

const createPage = useAsyncAction(async () => {
  const page = await $fetch<Page>('/pages', { method: 'POST', body: { config: { title: newPageTitle.value, elements: [] } } })
  await router.push({ path: `/pages/${page._id}` })
})

</script>

<i18n lang="yaml">
  en:
    cancel: Cancel
    create: Create
    createNewPage: Create a new page
    newPageTitle: New Page Title
    newPageStaging: New Page Staging
    search: Search
    showAllPages: Show all pages

  fr:
    cancel: Annuler
    create: Créer
    createNewPage: Créer une nouvelle page
    newPageTitle: Titre de la nouvelle page
    newPageStaging: Page de pré-production
    search: Rechercher
    showAllPages: Voir toutes les pages

</i18n>

<!--
<style scoped>
</style>
-->
