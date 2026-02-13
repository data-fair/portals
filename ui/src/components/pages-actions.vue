<template>
  <!-- Create new page -->
  <v-list-item @click="goToNewPage()">
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiPlusCircle"
      />
    </template>
    {{ t('createNewPage') }}
  </v-list-item>

  <!-- Create new group -->
  <v-menu
    v-model="newGroupMenu"
    location="start"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon
            color="primary"
            :icon="mdiFolderPlusOutline"
          />
        </template>
        {{ t('createNewGroup') }}
      </v-list-item>
    </template>
    <v-card
      data-iframe-height
      min-width="300"
      rounded="lg"
      :loading="createGroup.loading.value ? 'primary' : undefined"
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

  <!-- Group management menu -->
  <v-menu
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
      :loading="editGroup.loading.value ? 'primary' : undefined"
    >
      <v-card-text>
        <v-select
          v-model="editGroupId"
          :items="editableGroups"
          item-title="title"
          item-value="_id"
          :label="t('selectGroup')"
          density="comfortable"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="editGroupTitle"
          :label="t('editGroupTitle')"
          density="comfortable"
          variant="outlined"
          :disabled="!editGroupId"
          class="mt-4"
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
          :disabled="!editGroupId"
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
          :disabled="!editGroupId || !editGroupTitle || editGroupDescription.length > 100"
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
        <v-alert
          class="mt-4"
          type="warning"
          variant="outlined"
          :text="t('deleteGroupWarning')"
        />
        <v-select
          v-if="deletableGroups.length"
          v-model="deleteGroupId"
          :items="deletableGroups"
          item-title="title"
          item-value="_id"
          :label="t('selectGroupToDelete')"
          class="mt-4"
          density="comfortable"
          hide-details
          variant="outlined"
        />
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
          :disabled="!deleteGroupId"
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

  <!-- Portals filters -->
  <v-autocomplete
    v-model="portalsSelected"
    :items="portalsItems"
    item-title="display"
    item-value="portalId"
    :label="t('portal')"
    chips
    class="mt-4 mx-4"
    clearable
    closable-chips
    density="compact"
    hide-details
    multiple
    rounded="xl"
    variant="outlined"
  />

  <!-- Page types filters -->
  <v-autocomplete
    v-model="typesSelected"
    :items="typesItems"
    item-title="display"
    item-value="type"
    class="mt-4 mx-4"
    density="compact"
    :label="t('pageType.title')"
    rounded="xl"
    variant="outlined"
    hide-details
    chips
    clearable
    closable-chips
    multiple
  />

  <!-- Page groups filters (only custom groups) -->
  <v-autocomplete
    v-if="groupFilterItems.length > 0"
    v-model="groupsSelected"
    :items="groupFilterItems"
    item-title="display"
    item-value="id"
    class="mt-4 mx-4"
    density="compact"
    :label="t('pageGroup')"
    rounded="xl"
    variant="outlined"
    hide-details
    chips
    clearable
    closable-chips
    multiple
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

  <!-- Owner filters (only if showAll and admin) -->
  <v-autocomplete
    v-if="showAll"
    v-model="ownersSelected"
    :items="ownersItems"
    item-title="display"
    item-value="ownerKey"
    :label="t('owner')"
    chips
    class="mt-2 mx-4 text-admin"
    clearable
    closable-chips
    density="compact"
    hide-details
    multiple
    rounded="xl"
    variant="outlined"
  />
</template>

<script setup lang="ts">
import type { PagesFacets } from '#api/doc/pages/get-res/index.ts'
import type { PagesGetRes } from '#api/doc/pages/get-res'
import type { Group } from '#api/types/group'
import { useRules } from 'vuetify/labs/rules'
import { mdiMagnify, mdiPlusCircle, mdiPencil, mdiDelete, mdiFolderPlusOutline } from '@mdi/js'

const { t } = useI18n()
const rules = useRules() // https://vuetifyjs.com/en/features/rules/
const router = useRouter()

const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const showAll = defineModel('showAll', { type: Boolean, default: false })
const typesSelected = defineModel('typesSelected', { type: Array, required: true })
const groupsSelected = defineModel('groupsSelected', { type: Array, required: true })
const portalsSelected = defineModel('portalsSelected', { type: Array, required: true })
const ownersSelected = defineModel('ownersSelected', { type: Array, required: true })

const { facets, currentGroupId } = defineProps<{
  facets: PagesFacets,
  currentGroupId?: string
}>()
const emit = defineEmits<{ (e: 'refresh-group'): void }>()

const newGroupMenu = ref(false)
const newGroupTitle = ref('')
const newGroupDescription = ref('')

const editGroupMenu = ref(false)
const editGroupId = ref<string | null>(null)
const editGroupTitle = ref('')
const editGroupDescription = ref('')
const deleteGroupMenu = ref(false)
const deleteGroupId = ref<string | null>(null)

const groupsParams = computed(() => ({
  size: 1000,
  sort: 'updatedAt:-1'
}))
const groupsFetch = useFetch<{ results: Group[], count: number }>(
  $apiPath + '/groups',
  { query: groupsParams }
)

const groupFilterItems = computed(() => {
  // Only return custom groups for filtering
  return groupsFetch.data.value?.results?.map(group => ({ id: group._id, display: group.title })) ?? []
})

const portalsFetch = useFetch<{ results: Array<{ _id: string, title: string }> }>(
  $apiPath + '/portals',
  { query: { select: '_id,title', size: 10000 } }
)

const portalsItems = computed(() => {
  if (!facets.portals || !portalsFetch.data.value?.results) return []

  return Object.entries(facets.portals)
    .map(([portalId, count]) => {
      const portal = portalsFetch.data.value?.results.find(p => p._id === portalId)
      return {
        display: `${portal?.title || portalId} (${count})`,
        portalId
      }
    })
    .sort((a, b) => a.display.localeCompare(b.display))
})

const editableGroups = computed(() => groupsFetch.data.value?.results ?? [])

const groupPageCounts = ref<Record<string, number>>({})
const countsReady = ref(false)
const refreshGroupCounts = async () => {
  const groups = groupsFetch.data.value?.results ?? []
  if (!groups.length) {
    groupPageCounts.value = {}
    countsReady.value = true
    return
  }
  const counts = await Promise.all(groups.map(async group => {
    const res = await $fetch<PagesGetRes>('/pages', {
      query: {
        groupId: group._id,
        size: 1,
        select: '_id'
      }
    })
    return [group._id, res.count] as const
  }))
  groupPageCounts.value = Object.fromEntries(counts)
  countsReady.value = true
}

const deletableGroups = computed(() => {
  if (!countsReady.value) return []
  const groups = groupsFetch.data.value?.results ?? []
  return groups.filter(group => (groupPageCounts.value[group._id] ?? 0) === 0)
})

watch(groupsFetch.data, () => {
  countsReady.value = false
  refreshGroupCounts()
})

watch(newGroupMenu, () => {
  newGroupTitle.value = ''
  newGroupDescription.value = ''
})

watch(editGroupMenu, () => {
  if (!editGroupMenu.value) return
  if (!editGroupId.value && editableGroups.value.length) {
    editGroupId.value = editableGroups.value[0]._id
  }
  const selected = editableGroups.value.find(group => group._id === editGroupId.value)
  editGroupTitle.value = selected?.title || ''
  editGroupDescription.value = selected?.description || ''
})

watch(editGroupId, () => {
  const selected = editableGroups.value.find(group => group._id === editGroupId.value)
  editGroupTitle.value = selected?.title || ''
  editGroupDescription.value = selected?.description || ''
})

watch(deleteGroupMenu, () => {
  if (!deleteGroupMenu.value) return
  if (deletableGroups.value.length) deleteGroupId.value = deletableGroups.value[0]._id
  else deleteGroupId.value = null
})

const goToNewPage = async () => {
  await router.push({ path: '/pages/new' })
}

const createGroup = useAsyncAction(async () => {
  await $fetch<Group>('/groups', {
    method: 'POST',
    body: {
      title: newGroupTitle.value,
      description: newGroupDescription.value
    }
  })
  await groupsFetch.refresh()
  await refreshGroupCounts()
  newGroupMenu.value = false
})

const editGroup = useAsyncAction(async () => {
  if (!editGroupId.value) return
  await $fetch(`/groups/${editGroupId.value}`, {
    method: 'PATCH',
    body: {
      title: editGroupTitle.value,
      description: editGroupDescription.value
    }
  })
  await groupsFetch.refresh()
  await refreshGroupCounts()
  if (editGroupId.value === currentGroupId) emit('refresh-group')
  editGroupMenu.value = false
})

const deleteGroup = useAsyncAction(async () => {
  if (!deleteGroupId.value) return
  await $fetch(`/groups/${deleteGroupId.value}`, { method: 'DELETE' })
  await groupsFetch.refresh()
  await refreshGroupCounts()
  deleteGroupMenu.value = false
})

const typesItems = computed(() => {
  if (!facets.types) return []

  return Object.entries(facets.types)
    .map(
      ([type, count]) => {
        return {
          display: t(`pageType.${type}`) + ` (${count})`,
          type
        }
      }
    )
    .sort((a, b) => a.display.localeCompare(b.display))
})

const ownersItems = computed(() => {
  if (!facets.owners) return []

  return Object.entries(facets.owners)
    .flatMap(([, owner]) => {
      const items = []
      owner.departments?.forEach(department => {
        items.push({
          display: `${owner.name} - ${department.departmentName || department.department} (${department.count})`,
          ownerKey: `organization:${owner.id}:${department.department}`
        })
      })
      items.push({
        display: `${owner.name} (${owner.count})`,
        ownerKey: `${owner.type}:${owner.id}`
      })
      return items
    })
    .sort((a, b) => a.display.localeCompare(b.display))
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
    createNewGroup: Create a new group
    showAllPages: Show all pages
    editGroup: Edit a Group
    editGroupTitle: New Group Title
    editGroupDescription: New Group Description
    save: Save
    deleteGroup: Delete a group
    deletingGroup: Deleting a group
    newGroupTitle: New Group Title
    newGroupDescription: Description
    confirmDeleteGroup: Do you really want to delete the group "{title}"? Deletion is permanent and data cannot be recovered.
    groupNotEmptyError: Cannot delete the group while it contains pages
    no: No
    yes: Yes
    deleteGroupWarning: Only groups without any page can be deleted.
    owner: Owner
    portal: Portal
    pageGroup: Group
    pageType:
      title: Page Type
      home: Home
      contact: Contact
      privacy-policy: Privacy policy
      accessibility: Accessibility
      legal-notice: Legal Notice
      cookie-policy: Cookie Policy
      terms-of-service: Terms of Service
      datasets: Datasets Catalog
      applications: Applications Catalog
      reuses: Reuses Catalog
      event: Event
      news: News
      generic: Custom content
    selectGroup: Select a group
    selectGroupToDelete: Group to delete
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages

  fr:
    cancel: Annuler
    create: Créer
    createNewPage: Créer une nouvelle page
    createNewGroup: Créer un nouveau groupe
    newPageTitle: Titre de la nouvelle page
    newPageStaging: Page de pré-production
    search: Rechercher
    showAllPages: Voir toutes les pages
    editGroup: Modifier un groupe
    editGroupTitle: Nouveau titre du groupe
    editGroupDescription: Nouvelle description du groupe
    newGroupTitle: Titre du nouveau groupe
    newGroupDescription: Description
    save: Enregistrer
    deleteGroup: Supprimer un groupe
    deletingGroup: "Suppression d'un groupe"
    deleteGroupWarning: Seuls les groupes sans aucune page peuvent être supprimes.
    no: Non
    yes: Oui
    owner: Propriétaire
    portal: Portail
    pageGroup: Groupe
    selectGroup: Choisir un groupe
    selectGroupToDelete: Groupe à supprimer
    groupTitle:
      standard: Pages standard
      event: Événements
      news: Actualités
      default: Autres pages
    pageType:
      title: Type de page
      home: Accueil
      contact: Contact
      privacy-policy: Politique de confidentialité
      accessibility: Accessibilité
      legal-notice: Mentions légales
      cookie-policy: Politique de cookies
      terms-of-service: Conditions générales d'utilisation
      datasets: Catalogue de données
      applications: Catalogue de visualisations
      reuses: Catalogue de réutilisations
      event: Événement
      news: Actualité
      generic: Contenu libre
</i18n>
