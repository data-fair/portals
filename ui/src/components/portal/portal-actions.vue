<template>
  <!-- Validate draft -->
  <v-list-item
    :disabled="isSavingDraft || !hasDraftDiff"
    :loading="validateDraft.loading.value"
    @click="validateDraft.execute()"
  >
    <template #prepend>
      <v-icon
        color="success"
        :icon="mdiFileReplace"
      />
    </template>
    {{ t('validateDraft') }}
  </v-list-item>

  <!-- Cancel draft -->
  <v-menu
    v-model="showCancelDraftMenu"
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :disabled="isSavingDraft || !hasDraftDiff"
        :loading="cancelDraft.loading.value"
      >
        <template #prepend>
          <v-icon
            color="warning"
            :icon="mdiFileCancel"
          />
        </template>
        {{ t('cancelDraft') }}
      </v-list-item>
    </template>
    <template #default="{ isActive }">
      <v-card
        variant="elevated"
        :title="t('cancelingDraft')"
        :text="t('confirmCancelDraft')"
        :loading="cancelDraft.loading.value ? 'warning' : undefined"
      >
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="cancelDraft.loading.value"
            @click="isActive.value = false"
          >
            {{ t('no') }}
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="cancelDraft.loading.value"
            @click="cancelDraft.execute()"
          >
            {{ t('yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-menu>

  <v-divider class="my-2" />

  <!-- Events -->
  <custom-router-link :to="`/portals/${portal.id}/events`">
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiClipboardTextClock"
        />
      </template>
      {{ t('events') }}
    </v-list-item>
  </custom-router-link>

  <!-- Change owner -->
  <v-menu
    v-if="hasDepartments && (session.state.accountRole === 'admin' || session.state.user.adminMode)"
    v-model="showChangeOwnerMenu"
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        rounded
      >
        <template #prepend>
          <v-icon
            color="warning"
            :icon="mdiAccount"
          />
        </template>
        {{ t('changeOwner') }}
      </v-list-item>
    </template>
    <v-card
      rounded="lg"
      variant="elevated"
    >
      <v-card-title primary-title>
        {{ t('changeOwner') }}
      </v-card-title>
      <v-progress-linear
        v-if="changeOwner.loading.value"
        indeterminate
        color="warning"
      />
      <v-card-text>
        <owner-pick
          v-model="newOwner"
          v-model:ready="ownersReady"
          message=" "
        />
        <v-alert
          type="warning"
          :title="t('sensitiveOperation')"
          :text="t('changeOwnerWarning')"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="changeOwner.loading.value"
          @click="showChangeOwnerMenu = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="warning"
          variant="flat"
          :disabled="!ownersReady"
          :loading="changeOwner.loading.value"
          @click="changeOwner.execute()"
        >
          {{ t('confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <!-- Delete portal -->
  <v-menu
    v-model="showDeleteMenu"
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
        {{ t('deletePortal') }}
      </v-list-item>
    </template>
    <v-card
      rounded="lg"
      variant="elevated"
      :title="t('deletingPortal')"
      :loading="deletePortal.loading.value ? 'warning' : undefined"
    >
      <v-card-text class="pb-0">
        {{ t('confirmDeletePortal', { title: portal.title }) }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="deletePortal.loading.value"
          @click="showDeleteMenu = false"
        >
          {{ t('no') }}
        </v-btn>
        <v-btn
          color="warning"
          variant="flat"
          :loading="deletePortal.loading.value"
          @click="deletePortal.execute()"
        >
          {{ t('yes') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <v-divider
    v-if="session.state.user?.adminMode"
    class="my-2"
  />

  <!-- Manage domain exposure -->
  <custom-router-link
    v-if="session.state.user?.adminMode"
    :to="`/portals/${portal.id}/ingress`"
  >
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="admin"
          :icon="mdiShieldLinkVariant"
        />
      </template>
      {{ t('manageDomainExposure') }}
    </v-list-item>
  </custom-router-link>

  <!-- Manage whiteLabel -->
  <v-menu
    v-if="session.state.user?.adminMode"
    v-model="showWhiteLabelMenu"
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon
            color="admin"
            :icon="mdiShieldStar"
          />
        </template>
        {{ t('administration') }}
      </v-list-item>
    </template>
    <v-card
      color="admin"
      rounded="lg"
      variant="text"
      :title="t('administrationConfiguration')"
      :loading="updateWhiteLabel.loading.value ? 'admin' : undefined"
    >
      <v-card-text>
        <v-checkbox
          :model-value="portal.whiteLabel"
          :label="t('enableWhiteLabel')"
          :disabled="updateWhiteLabel.loading.value"
          color="admin"
          density="comfortable"
          hide-details
          @update:model-value="(value) => updateWhiteLabel.execute(!!value)"
        />
        <v-checkbox
          :model-value="portal.isReference"
          :label="t('defineIsReference')"
          :disabled="updateIsReference.loading.value"
          color="admin"
          density="comfortable"
          hide-details
          @update:model-value="(value) => updateIsReference.execute(!!value)"
        />
      </v-card-text>
    </v-card>
  </v-menu>

  <v-divider class="my-2" />

  <!-- View draft link -->
  <v-list-item
    :href="$uiConfig.portalUrlPattern.replace('{subdomain}', portal.id + '.draft')"
    target="_blank"
    rel="noopener"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiFileExport"
      />
    </template>
    {{ t('viewDraft') }}
  </v-list-item>

  <!-- View portal link -->
  <v-list-item
    :href="portal.url || $uiConfig.portalUrlPattern.replace('{subdomain}', portal.id)"
    target="_blank"
    rel="noopener"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiOpenInNew"
      />
    </template>
    {{ t('viewPortal') }}
  </v-list-item>

  <!-- View portal pages list -->
  <custom-router-link :to="`/pages?portal=${portal.id}`">
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiViewDashboardEdit"
        />
      </template>
      {{ t('viewPortalPages') }}
    </v-list-item>
  </custom-router-link>
</template>

<script setup lang="ts">
import { mdiDelete, mdiFileReplace, mdiFileExport, mdiFileCancel, mdiOpenInNew, mdiShieldLinkVariant, mdiAccount, mdiClipboardTextClock, mdiShieldStar, mdiViewDashboardEdit } from '@mdi/js'
import ownerPick from '@data-fair/lib-vuetify/owner-pick.vue'
import { computedAsync } from '@vueuse/core'

const { t } = useI18n()
const session = useSessionAuthenticated()
const router = useRouter()
const showChangeOwnerMenu = ref(false)
const showDeleteMenu = ref(false)
const showWhiteLabelMenu = ref(false)

const ownersReady = ref(false)
const newOwner = ref<Record<string, string> | null>(null)

const emit = defineEmits<{ (e: 'refresh-portal'): void }>()
const { portal } = defineProps<{
  hasDraftDiff: boolean
  isSavingDraft: boolean
  portal: {
    id: string
    title: string
    url: string | undefined
    whiteLabel?: boolean
    isReference?: boolean
  }
}>()
const showCancelDraftMenu = ref(false)

const validateDraft = useAsyncAction(async () => {
  await $fetch(`portals/${portal.id}/draft`, { method: 'POST' })
  emit('refresh-portal')
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`portals/${portal.id}/draft`, { method: 'DELETE' })
  emit('refresh-portal')
  showCancelDraftMenu.value = false
})

const changeOwner = useAsyncAction(
  async () => {
    await $fetch(`/portals/${portal.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ owner: newOwner.value })
    })
    showChangeOwnerMenu.value = false
  },
  {
    success: t('ownerChanged'),
    error: t('errorChangingOwner'),
  }
)

const deletePortal = useAsyncAction(async () => {
  await $fetch(`portals/${portal.id}`, { method: 'DELETE' })
  router.replace('/portals')
}, {
  success: t('portalDeleted'),
  error: t('errorDeletingPortal'),
})

const updateWhiteLabel = useAsyncAction(async (value: boolean) => {
  await $fetch(`/portals/${portal.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ whiteLabel: value })
  })
  emit('refresh-portal')
}, {
  success: t('whiteLabelUpdated'),
  error: t('errorUpdatingWhiteLabel'),
})

const updateIsReference = useAsyncAction(async (value: boolean) => {
  await $fetch(`/portals/${portal.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isReference: value })
  })
  emit('refresh-portal')
}, {
  success: t('isReferenceUpdated'),
  error: t('errorUpdatingIsReference'),
})

/** `True` if the active account isn't in a department and his organization has departments */
const hasDepartments = computedAsync(async (): Promise<boolean> => {
  if (session.state.account.department || session.state.account.type === 'user') return false
  const org = await $fetch<{ departments?: any[] }>(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath })
  return !!org.departments?.length
}, false)

</script>

<i18n lang="yaml">
  en:
    administration: Administration
    administrationConfiguration: Super admin configuration
    cancel: Cancel
    cancelDraft: Cancel draft
    cancelingDraft: Canceling draft
    confirmCancelDraft: Are you sure you want to cancel the draft? All changes will be lost and cannot be recovered.
    changeOwner: Change owner
    changeOwnerWarning: Changing the owner of a portal may have consequences on permissions.
    confirm: Confirm
    confirmDeletePortal: Do you really want to delete the portal "{title}"? Deletion is permanent and data cannot be recovered.
    defineIsReference: Define as reference template
    deletePortal: Delete portal
    deletingPortal: Deleting portal
    enableWhiteLabel: Enable white label
    errorChangingOwner: Error while changing the owner
    errorDeletingPortal: Error while deleting the portal
    errorUpdatingIsReference: Error while updating reference status
    errorUpdatingWhiteLabel: Error while updating white label
    events: Events
    isReferenceUpdated: Reference status updated!
    manageDomainExposure: Manage domain exposure
    no: No
    ownerChanged: Owner changed!
    portalDeleted: Portal deleted!
    sensitiveOperation: Sensitive operation
    validateDraft: Validate draft
    viewDraft: View draft
    viewPortal: View portal
    viewPortalPages: View published pages on this portal
    whiteLabelUpdated: White label updated!
    yes: Yes

  fr:
    administration: Administration
    administrationConfiguration: Configuration super administrateur
    cancel: Annuler
    cancelDraft: Annuler le brouillon
    cancelingDraft: Annulation du brouillon
    confirmCancelDraft: Êtes-vous sûr de vouloir annuler le brouillon ? Tous les changements seront perdus et ne pourront pas être récupérés.
    changeOwner: Changer le propriétaire
    changeOwnerWarning: Changer le propriétaire d'un portail peut avoir des conséquences sur les permissions.
    confirm: Confirmer
    confirmDeletePortal: Voulez-vous vraiment supprimer le portail "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    defineIsReference: Définir comme modèle de référence
    deletePortal: Supprimer le portail
    deletingPortal: Suppression du portail
    enableWhiteLabel: Activer la marque blanche
    errorChangingOwner: Erreur lors du changement de propriétaire
    errorDeletingPortal: Erreur lors de la suppression du portail
    errorUpdatingIsReference: Erreur lors de la mise à jour du statut de modèle de référence
    errorUpdatingWhiteLabel: Erreur lors de la mise à jour de la marque blanche
    events: Traçabilité
    isReferenceUpdated: Statut de référence mis à jour !
    manageDomainExposure: Exposition du domaine
    no: Non
    ownerChanged: Propriétaire changé !
    portalDeleted: Portail supprimé !
    sensitiveOperation: Opération sensible
    validateDraft: Valider le brouillon
    viewDraft: Voir le brouillon
    viewPortal: Visiter le portail
    viewPortalPages: Voir les pages publiées sur ce portail
    whiteLabelUpdated: Marque blanche mise à jour !
    yes: Oui

</i18n>

<style scoped>
</style>
