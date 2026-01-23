<template>
  <!-- Edit config -->
  <custom-router-link :to="`/reuses/${reuseId}/edit-config`">
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiFileEdit"
        />
      </template>
      {{ t('editConfig') }}
    </v-list-item>
  </custom-router-link>

  <!-- Validate draft -->
  <v-list-item
    :loading="validateDraft.loading.value"
    :disabled="cancelDraft.loading.value || !hasDraftDiff"
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
        :loading="cancelDraft.loading.value"
        :disabled="validateDraft.loading.value || !hasDraftDiff"
        :title="t('cancelDraft')"
      >
        <template #prepend>
          <v-icon
            color="warning"
            :icon="mdiFileCancel"
          />
        </template>
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

  <!-- Delete reuse -->
  <v-menu
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :loading="deleteReuse.loading.value"
      >
        <template #prepend>
          <v-icon
            color="warning"
            :icon="mdiDelete"
          />
        </template>
        <!-- Text in slot to prevent wrapping (would be wrapped if in title prop) -->
        {{ t('deleteReuse') }}
      </v-list-item>
    </template>
    <template #default="{ isActive }">
      <v-card
        variant="elevated"
        :title="t('deletingReuse')"
        :text="t('confirmDeleteReuse', { title: reuse?.config.title })"
        :loading="deleteReuse.loading.value ? 'warning' : undefined"
      >
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="deleteReuse.loading.value"
            @click="isActive.value = false"
          >
            {{ t('no') }}
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="deleteReuse.loading.value"
            @click="deleteReuse.execute()"
          >
            {{ t('yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import { mdiAccount, mdiFileEdit, mdiDelete, mdiFileReplace, mdiFileCancel } from '@mdi/js'
import ownerPick from '@data-fair/lib-vuetify/owner-pick.vue'
import { computedAsync } from '@vueuse/core'

const { t } = useI18n()
const { reuseFetch, reuse, hasDraftDiff } = useReuseStore()
const session = useSessionAuthenticated()
const router = useRouter()
const showChangeOwnerMenu = ref(false)
const showCancelDraftMenu = ref(false)

const ownersReady = ref(false)
const newOwner = ref<Record<string, string> | null>(null)

const { reuseId } = defineProps<{ reuseId: string }>()

const validateDraft = useAsyncAction(
  async () => {
    await $fetch(`/reuses/${reuseId}/draft`, { method: 'POST' })
    reuseFetch.refresh()
  },
  {
    success: t('draftValidated'),
    error: t('errorValidatingDraft')
  }
)

const cancelDraft = useAsyncAction(
  async () => {
    await $fetch(`/reuses/${reuseId}/draft`, { method: 'DELETE' })
    await reuseFetch.refresh()
    showCancelDraftMenu.value = false
  },
  {
    success: t('draftCanceled'),
    error: t('errorCancelingDraft')
  }
)

const changeOwner = useAsyncAction(
  async () => {
    await $fetch(`/reuses/${reuseId}`, {
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

const deleteReuse = useAsyncAction(async () => {
  await $fetch(`/reuses/${reuseId}`, { method: 'DELETE' })
  router.push('/reuses')
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
    changeOwner: Change owner
    changeOwnerWarning: Changing the owner of a reuse may have consequences on permissions.
    confirm: Confirm
    confirmCancelDraft: Are you sure you want to cancel the draft? All changes will be lost and cannot be recovered.
    confirmDeleteReuse: Do you really want to delete the reuse "{title}"? Deletion is permanent and data cannot be recovered.
    deleteReuse: Delete reuse
    deletingReuse: Deleting reuse
    draftCanceled: Draft canceled!
    draftValidated: Draft validated!
    editConfig: Edit config
    errorCancelingDraft: Error while canceling the draft
    errorChangingOwner: Error while changing the owner
    errorValidatingDraft: Error while validating the draft
    no: No
    ownerChanged: Owner changed!
    sensitiveOperation: Sensitive operation
    validateDraft: Validate draft
    yes: Yes
  fr:
    cancel: Annuler
    cancelDraft: Annuler le brouillon
    cancelingDraft: Annulation du brouillon
    changeOwner: Changer le propriétaire
    changeOwnerWarning: Changer le propriétaire d'une réutilisation peut avoir des conséquences sur les permissions.
    confirm: Confirmer
    confirmCancelDraft: Êtes-vous sûr de vouloir annuler le brouillon ? Tous les changements seront perdus et ne pourront pas être récupérés.
    confirmDeleteReuse: Voulez-vous vraiment supprimer la réutilisation "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    deleteReuse: Supprimer la réutilisation
    deletingReuse: Suppression de la réutilisation
    draftCanceled: Brouillon annulé !
    draftValidated: Brouillon validé !
    editConfig: Éditer la configuration
    errorCancelingDraft: Erreur lors de l'annulation du brouillon
    errorChangingOwner: Erreur lors de le changement de propriétaire
    errorValidatingDraft: Erreur lors de la validation du brouillon
    no: Non
    ownerChanged: Propriétaire changé !
    sensitiveOperation: Opération sensible
    validateDraft: Valider le brouillon
    yes: Oui

</i18n>
