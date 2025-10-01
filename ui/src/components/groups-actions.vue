<template>
  <v-menu
    v-model="newGroupMenu"
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
        {{ t('createNewGroup') }}
      </v-list-item>
    </template>
    <v-card
      data-iframe-height
      min-width="300"
      rounded="lg"
      :loading="createGroup.loading.value ? 'primary' : false"
    >
      <v-card-text>
        <v-text-field
          v-model="newGroupTitle"
          :label="t('newGroupTitle')"
          density="comfortable"
          variant="outlined"
          autofocus
          auto-grow
          hide-details
        />
        <v-textarea
          v-model="newGroupDescription"
          :label="t('newGroupDescription')"
          :rules="[(v: string) => v.length <= 100 || t('maxCharacters')]"
          :counter="100"
          class="mt-4"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          no-resize
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="createGroup.loading.value"
          @click="newGroupMenu = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!newGroupTitle || newGroupDescription.length > 100"
          :loading="createGroup.loading.value ? 'primary' : false"
          @click="createGroup.execute()"
        >
          {{ t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <!-- Show all switch (admin only) -->
  <v-switch
    v-if="session.user.value.adminMode"
    v-model="showAll"
    color="admin"
    class="mx-4 text-admin"
    :label="t('showAllGroups')"
    hide-details
  />
</template>

<script setup lang="ts">
import type { Group } from '#api/types/group'
import { mdiPlusCircle } from '@mdi/js'

const { t } = useI18n()
const router = useRouter()
const session = useSessionAuthenticated()
const showAll = defineModel('showAll', { type: Boolean, default: false })

const newGroupMenu = ref(false)
const newGroupTitle = ref('')
const newGroupDescription = ref('')
watch(newGroupMenu, () => {
  newGroupTitle.value = ''
  newGroupDescription.value = ''
})

const createGroup = useAsyncAction(async () => {
  const group = await $fetch<Group>('/groups', {
    method: 'POST',
    body: {
      title: newGroupTitle.value,
      description: newGroupDescription.value
    }
  })
  await router.push({ path: `/pages/${group._id}` })
})
</script>

<i18n lang="yaml">
  en:
    cancel: Cancel
    create: Create
    createNewGroup: Create a new group
    newGroupTitle: New Group Title
    newGroupDescription: Description
    search: Search
    showAllGroups: Show all groups
    maxCharacters: Maximum 100 characters

  fr:
    cancel: Annuler
    create: Créer
    createNewGroup: Créer un nouveau groupe
    newGroupTitle: Titre du nouveau groupe
    newGroupDescription: Description
    search: Rechercher
    showAllGroups: Voir tous les groupes
    maxCharacters: Maximum 100 caractères

</i18n>
