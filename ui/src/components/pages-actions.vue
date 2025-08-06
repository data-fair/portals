<template>
  <v-list
    density="compact"
    data-iframe-height
  >
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
          Créer une nouvelle page
        </v-list-item>
      </template>
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="newPageTitle"
            variant="outlined"
            hide-details
            density="comfortable"
            label="titre de la nouvelle page"
            autofocus
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="newPageMenu = false">
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!newPageTitle || createPage.loading.value"
            variant="flat"
            @click="createPage.execute()"
          >
            Créer la page
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
    <v-list-item>
      <v-text-field
        v-model="search"
        :append-inner-icon="mdiMagnify"
        clearable
        color="primary"
        density="compact"
        hide-details
        hide-selected
        placeholder="rechercher"
        style="max-width:400px;"
        variant="outlined"
      />
    </v-list-item>
    <v-list-item v-if="session.user.value.adminMode">
      <v-switch
        v-model="showAll"
        density="compact"
        color="admin"
        label="Voir toutes les pages"
        hide-details
        class="pl-3 text-admin"
      />
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">

import { Page } from '#api/types/page'
import { mdiMagnify, mdiPlusCircle } from '@mdi/js'

const session = useSessionAuthenticated()
const router = useRouter()

const search = defineModel('search', { type: String, default: '' })
const showAll = defineModel('showAll', { type: Boolean, default: false })

const newPageMenu = ref(false)
const newPageTitle = ref('')
watch(newPageMenu, () => { newPageTitle.value = '' })

const createPage = useAsyncAction(async () => {
  const page = await $fetch<Page>('/pages', { method: 'POST', body: { config: { title: newPageTitle.value, elements: [] } } })
  await router.replace({ path: `/pages/${page._id}` })
})

</script>

<style scoped>
</style>
