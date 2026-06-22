<template>
  <df-navigation-right>
    <!-- Create new page -->
    <custom-router-link :to="'/pages/new'">
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

    <!-- Create new group -->
    <group-form
      mode="create"
      @saved="groupsFetch.refresh()"
    />

    <!-- Edit a group -->
    <group-form
      mode="edit"
      :groups="editableGroups"
      @saved="groupsFetch.refresh()"
    />

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
            {{ t('cancel') }}
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="deleteGroup.loading.value"
            :disabled="!deleteGroupId"
            @click="deleteGroup.execute()"
          >
            {{ t('delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- Search field -->
    <df-search-field
      v-model="search"
      class="mt-4"
    />

    <!-- Sort field -->
    <sort-field
      v-model="sort"
      :disabled="!!search"
    />

    <!-- Portals filters -->
    <v-autocomplete
      v-model="portalsSelected"
      :items="portalsItems"
      item-title="display"
      item-value="portalId"
      :label="t('portal')"
      class="mt-4 mx-4"
      chips
      closable-chips
      multiple
    />

    <!-- Page types filters -->
    <v-autocomplete
      v-model="typesSelected"
      :items="typesItems"
      item-title="display"
      item-value="type"
      :label="t('pageType.title')"
      class="mt-4 mx-4"
      chips
      closable-chips
      multiple
    />

    <!-- Page groups filters -->
    <v-autocomplete
      v-if="groupsItems.length > 0"
      v-model="groupsSelected"
      :items="groupsItems"
      item-title="display"
      item-value="id"
      :label="t('pageGroup')"
      class="mt-4 mx-4"
      chips
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
    />

    <!-- Owner filters (only if showAll and admin) -->
    <v-autocomplete
      v-if="showAll"
      v-model="ownersSelected"
      :items="ownersItems"
      item-title="display"
      item-value="ownerKey"
      :label="t('owner')"
      class="mt-2 mx-4 text-admin"
      chips
      closable-chips
      multiple
    />
  </df-navigation-right>
</template>

<script setup lang="ts">
import type { PagesFacets } from '#api/doc/pages/get-res/index.ts'
import type { Group } from '#api/types/group'
import { mdiPlusCircle, mdiDelete } from '@mdi/js'
import dfNavigationRight from '@data-fair/lib-vuetify/navigation-right.vue'
import dfSearchField from '@data-fair/lib-vuetify/search-field.vue'

const { t } = useI18n()

const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })
const sort = defineModel('sort', { type: String, default: 'createdAt:-1' })
const showAll = defineModel('showAll', { type: Boolean, default: false })
const portalsSelected = defineModel('portalsSelected', { type: Array, required: true })
const typesSelected = defineModel('typesSelected', { type: Array, required: true })
const groupsSelected = defineModel('groupsSelected', { type: Array, required: true })
const ownersSelected = defineModel('ownersSelected', { type: Array, required: true })

const { facets } = defineProps<{
  facets: PagesFacets
}>()

const deleteGroupMenu = ref(false)
const deleteGroupId = ref<string | null>(null)

const groupsFetch = useFetch<{ results: Group[], count: number }>(
  $apiPath + '/groups',
  { query: { size: 1000 } }
)

const groupsItems = computed(() => {
  const groups = (facets as PagesFacets & { groups?: Record<string, number> }).groups ?? {}
  if (!Object.keys(groups).length || !groupsFetch.data.value?.results) return []

  return Object.entries(groups)
    .map(([groupId, count]) => {
      const group = groupsFetch.data.value?.results.find(item => item._id === groupId)
      return {
        display: `${group?.title || groupId} (${count})`,
        id: groupId
      }
    })
    .sort((a, b) => a.display.localeCompare(b.display))
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

const editableGroups = computed(() => groupsFetch.data.value?.results ?? [])

const deletableGroups = computed(() => {
  const groupsCounts = (facets as PagesFacets & { groups?: Record<string, number> }).groups ?? {}
  if (!groupsFetch.data.value?.results || !Object.keys(groupsCounts).length) return []
  const groups = groupsFetch.data.value?.results ?? []
  return groups.filter(group => (groupsCounts[group._id] ?? 0) === 0)
})

watch(deleteGroupMenu, () => {
  if (!deleteGroupMenu.value) return
  if (deletableGroups.value.length) deleteGroupId.value = deletableGroups.value[0]._id
  else deleteGroupId.value = null
})

const deleteGroup = useAsyncAction(
  async () => {
    if (!deleteGroupId.value) return
    await $fetch(`/groups/${deleteGroupId.value}`, { method: 'DELETE' })
    await groupsFetch.refresh()
    deleteGroupMenu.value = false
  },
  {
    success: t('deleteGroupSuccess'),
    error: t('deleteGroupError')
  }
)

</script>

<i18n lang="yaml">
  en:
    cancel: Cancel
    createNewPage: Create a new page
    newPageTitle: New Page Title
    showAllPages: Show all pages
    deleteGroup: Delete a group
    deletingGroup: Deleting a group
    deleteGroupSuccess: Group deleted.
    deleteGroupError: Error while deleting the group.
    confirmDeleteGroup: Do you really want to delete the group "{title}"? Deletion is permanent and data cannot be recovered.
    groupNotEmptyError: Cannot delete the group while it contains pages
    delete: Delete
    deleteGroupWarning: Only groups without any page can be deleted.
    owner: Owner
    portal: Portal
    pageGroup: Group
    pageType:
      title: Page Type
      home: Home
      contact: Contact
      accessibility: Accessibility
      terms-of-service: Terms of Service
      legal-notice: Legal Notice
      privacy-policy: Privacy policy
      cookie-policy: Cookie Policy
      datasets: Datasets Catalog
      applications: Applications Catalog
      reuses: Reuses Catalog
      event-catalog: Events Catalog
      news-catalog: News Catalog
      event: Event
      news: News
      generic: Custom content
    selectGroupToDelete: Group to delete
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages

  fr:
    cancel: Annuler
    createNewPage: Créer une nouvelle page
    newPageTitle: Titre de la nouvelle page
    showAllPages: Voir toutes les pages
    deleteGroup: Supprimer un groupe
    deletingGroup: "Suppression d'un groupe"
    deleteGroupSuccess: Groupe supprimé.
    deleteGroupError: Erreur lors de la suppression du groupe.
    deleteGroupWarning: Seuls les groupes sans aucune page peuvent être supprimes.
    delete: Supprimer
    owner: Propriétaire
    portal: Portail
    pageGroup: Groupe
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
      accessibility: Accessibilité
      terms-of-service: Conditions générales d'utilisation
      legal-notice: Mentions légales
      privacy-policy: Politique de confidentialité
      cookie-policy: Politique de cookies
      datasets: Catalogue de données
      applications: Catalogue de visualisations
      reuses: Catalogue de réutilisations
      event-catalog: Catalogue d'événements
      news-catalog: Catalogue d'actualités
      event: Événement
      news: Actualité
      generic: Contenu libre
</i18n>
