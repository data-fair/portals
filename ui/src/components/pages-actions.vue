<template>
  <!-- Create new page -->
  <custom-router-link :to="`/pages/${group._id}/new`">
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiPlusCircle"
        />
      </template>
      {{ t('createNewPage') }}
    </v-list-item>
  </custom-router-link>

  <!-- Group management menu -->
  <v-menu
    v-if="!isBaseGroup"
    v-model="editGroupMenu"
    location="start"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon
            color="primary"
            :icon="mdiPencil"
          />
        </template>
        {{ t('editGroup') }}
      </v-list-item>
    </template>
    <v-card
      data-iframe-height
      min-width="300"
      rounded="lg"
      :loading="editGroup.loading.value ? 'primary' : false"
    >
      <v-card-text>
        <v-text-field
          v-model="editGroupTitle"
          :label="t('editGroupTitle')"
          density="comfortable"
          variant="outlined"
          autofocus
          auto-grow
          hide-details
        />
        <v-textarea
          v-model="editGroupDescription"
          :label="t('editGroupDescription')"
          :rules="[rules.maxLength(100)]"
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
          :disabled="editGroup.loading.value"
          @click="editGroupMenu = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!editGroupTitle || editGroupDescription.length > 100"
          :loading="editGroup.loading.value ? 'primary' : false"
          @click="editGroup.execute()"
        >
          {{ t('save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <!-- Delete group menu -->
  <v-menu
    v-if="!isBaseGroup"
    v-model="deleteGroupMenu"
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon
            color="warning"
            :icon="mdiDelete"
          />
        </template>
        {{ t('deleteGroup') }}
      </v-list-item>
    </template>
    <v-card
      rounded="lg"
      variant="elevated"
      :title="t('deletingGroup')"
      :loading="deleteGroup.loading.value ? 'warning' : undefined"
    >
      <v-card-text class="pb-0">
        {{ t('confirmDeleteGroup', { title: group.title }) }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="deleteGroup.loading.value"
          @click="deleteGroupMenu = false"
        >
          {{ t('no') }}
        </v-btn>
        <v-btn
          color="warning"
          variant="flat"
          :loading="deleteGroup.loading.value"
          @click="deleteGroup.execute()"
        >
          {{ t('yes') }}
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
import { useRules } from 'vuetify/labs/rules'
import { mdiMagnify, mdiPlusCircle, mdiPencil, mdiDelete } from '@mdi/js'

const { t } = useI18n()
const rules = useRules() // https://vuetifyjs.com/en/features/rules/
const router = useRouter()
const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const showAll = defineModel('showAll', { type: Boolean, default: false })
const { group } = defineProps < { group: { _id: string, slug: string, title: string, description?: string } }>()
const emit = defineEmits<{ (e: 'refresh-group'): void }>()

const editGroupMenu = ref(false)
const editGroupTitle = ref(group.title)
const editGroupDescription = ref(group.description || '')
const deleteGroupMenu = ref(false)

const isBaseGroup = ['standard', 'event', 'news', 'default'].includes(group._id)

watch(editGroupMenu, () => {
  editGroupTitle.value = group.title
  editGroupDescription.value = group.description || ''
})

const editGroup = useAsyncAction(async () => {
  await $fetch(`/groups/${group._id}`, {
    method: 'PATCH',
    body: {
      title: editGroupTitle.value,
      description: editGroupDescription.value
    }
  })
  emit('refresh-group')
  editGroupMenu.value = false
})

const deleteGroup = useAsyncAction(async () => {
  await $fetch(`/groups/${group._id}`, { method: 'DELETE' })
  router.push({ path: '/pages' })
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
    editGroup: Edit Group
    editGroupTitle: Edit Group Title
    editGroupDescription: Edit Group Description
    save: Save
    deleteGroup: Delete group
    deletingGroup: Deleting group
    confirmDeleteGroup: Do you really want to delete the group "{title}"? Deletion is permanent and data cannot be recovered.
    no: No
    yes: Yes

  fr:
    cancel: Annuler
    create: Créer
    createNewPage: Créer une nouvelle page
    newPageTitle: Titre de la nouvelle page
    newPageStaging: Page de pré-production
    search: Rechercher
    showAllPages: Voir toutes les pages
    editGroup: Modifier le groupe
    editGroupTitle: Modifier le titre du groupe
    editGroupDescription: Modifier la description du groupe
    save: Enregistrer
    deleteGroup: Supprimer le groupe
    deletingGroup: Suppression du groupe
    confirmDeleteGroup: Voulez-vous vraiment supprimer le groupe "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    no: Non
    yes: Oui
</i18n>
