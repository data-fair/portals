<template>
  <v-list
    density="compact"
    data-iframe-height
  >
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
          Créer un nouveau portail
        </v-list-item>
      </template>
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="newPortalTitle"
            variant="outlined"
            hide-details
            density="comfortable"
            label="titre du nouveau portal"
            autofocus
          />
          <v-checkbox
            v-model="newPortalStaging"
            hide-details
            density="comfortable"
            label="portail de pré-production"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="newPortalMenu = false">
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!newPortalTitle || createPortal.loading.value"
            variant="flat"
            @click="createPortal.execute()"
          >
            Créer le portail
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
        label="Voir tous les portals"
        hide-details
        class="pl-3 text-admin"
      />
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">

import { Portal } from '#api/types/portal'
import { mdiMagnify, mdiPlusCircle } from '@mdi/js'

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
      config: { title: newPortalTitle.value, authentication: 'optional' }
    }
  })
  await router.replace({ path: `/portals/${portal._id}` })
})

</script>

<style scoped>
</style>
