<template>
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

  <v-divider class="my-2" />

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
</template>

<script setup lang="ts">
import { mdiFileReplace, mdiFileExport, mdiFileCancel, mdiOpenInNew, mdiShieldLinkVariant, mdiAccount, mdiClipboardTextClock } from '@mdi/js'
import ownerPick from '@data-fair/lib-vuetify/owner-pick.vue'
import { computedAsync } from '@vueuse/core'

const { t } = useI18n()
const session = useSessionAuthenticated()
const router = useRouter()
const showChangeOwnerMenu = ref(false)
const showDeleteMenu = ref(false)

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

/** `True` if the active account isn't in a department and his organization has departments */
const hasDepartments = computedAsync(async (): Promise<boolean> => {
  if (session.state.account.department || session.state.account.type === 'user') return false
  const org = await $fetch<{ departments?: any[] }>(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath })
  return !!org.departments?.length
}, false)

</script>

<i18n lang="yaml">
  en:
    cancel: Cancel
    cancelDraft: Cancel draft
    cancelingDraft: Canceling draft
    confirmCancelDraft: Are you sure you want to cancel the draft? All changes will be lost and cannot be recovered.
    changeOwner: Change owner
    changeOwnerWarning: Changing the owner of a portal may have consequences on permissions.
    confirm: Confirm
    confirmDeletePortal: Do you really want to delete the portal "{title}"? Deletion is permanent and data cannot be recovered.
    deletePortal: Delete portal
    deletingPortal: Deleting portal
    errorChangingOwner: Error while changing the owner
    errorDeletingPortal: Error while deleting the portal
    events: Events
    manageDomainExposure: Manage domain exposure
    no: No
    ownerChanged: Owner changed!
    portalDeleted: Portal deleted!
    sensitiveOperation: Sensitive operation
    validateDraft: Validate draft
    viewDraft: View draft
    viewPortal: View portal
    yes: Yes

  fr:
    cancel: Annuler
    cancelDraft: Annuler le brouillon
    cancelingDraft: Annulation du brouillon
    confirmCancelDraft: Êtes-vous sûr de vouloir annuler le brouillon ? Tous les changements seront perdus et ne pourront pas être récupérés.
    changeOwner: Changer le propriétaire
    changeOwnerWarning: Changer le propriétaire d'un portail peut avoir des conséquences sur les permissions.
    confirm: Confirmer
    confirmDeletePortal: Voulez-vous vraiment supprimer le portail "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    deletePortal: Supprimer le portail
    deletingPortal: Suppression du portail
    errorChangingOwner: Erreur lors de le changement de propriétaire
    errorDeletingPortal: Erreur lors de la suppression du portail
    events: Traçabilité
    manageDomainExposure: Gérer l'exposition du domaine
    no: Non
    ownerChanged: Propriétaire changé !
    portalDeleted: Portail supprimé !
    sensitiveOperation: Opération sensible
    validateDraft: Valider le brouillon
    viewDraft: Voir le brouillon
    viewPortal: Visiter le portail
    yes: Oui

</i18n>

<style scoped>
</style>
