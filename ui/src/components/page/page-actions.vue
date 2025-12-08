<template>
  <!-- Edit draft -->
  <custom-router-link :to="`/pages/${groupId}/${pageId}/edit-config`">
    <v-list-item link>
      <template #prepend>
        <v-icon
          color="primary"
          :icon="mdiFileEdit"
        />
      </template>
      {{ t('editDraft') }}
    </v-list-item>
  </custom-router-link>

  <!-- Validate draft -->
  <v-list-item
    :loading="validateDraft.loading.value"
    :disabled="cancelDraft.loading.value || !hasDraftDiff"
    :title="t('validateDraft')"
    @click="validateDraft.execute()"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiFileReplace"
      />
    </template>
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

  <!-- Delete page -->
  <v-menu
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :loading="deletePage.loading.value"
        :title="t('deletePage')"
      >
        <template #prepend>
          <v-icon
            color="warning"
            :icon="mdiDelete"
          />
        </template>
      </v-list-item>
    </template>
    <template #default="{ isActive }">
      <v-card
        variant="elevated"
        :title="t('deletingPage')"
        :text="t('confirmDeletePage', { title: pageFetch.data.value?.config.title })"
        :loading="deletePage.loading.value ? 'warning' : undefined"
      >
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="deletePage.loading.value"
            @click="isActive.value = false"
          >
            {{ t('no') }}
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="deletePage.loading.value"
            @click="deletePage.execute()"
          >
            {{ t('yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import { mdiAccount, mdiFileEdit, mdiFileReplace, mdiFileCancel, mdiDelete } from '@mdi/js'
import ownerPick from '@data-fair/lib-vuetify/owner-pick.vue'
import { computedAsync } from '@vueuse/core'

const { t } = useI18n()
const { pageFetch, hasDraftDiff } = usePageStore()
const session = useSessionAuthenticated()
const router = useRouter()
const showChangeOwnerMenu = ref(false)
const showCancelDraftMenu = ref(false)

const ownersReady = ref(false)
const newOwner = ref<Record<string, string> | null>(null)

const { groupId, pageId } = defineProps<{ groupId: string, pageId: string }>()

const validateDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}/draft`, { method: 'POST' })
  await pageFetch.refresh()
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}/draft`, { method: 'DELETE' })
  await pageFetch.refresh()
  showCancelDraftMenu.value = false
})

const changeOwner = useAsyncAction(
  async () => {
    await $fetch(`/pages/${pageId}`, {
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

const deletePage = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}`, { method: 'DELETE' })
  router.push(`/pages/${groupId}`)
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
    changeOwnerWarning: Changing the owner of a page may have consequences on permissions.
    confirm: Confirm
    confirmDeletePage: Do you really want to delete the page "{title}"? Deletion is permanent and data cannot be recovered.
    deletePage: Delete page
    deletingPage: Deleting page
    editDraft: Edit draft
    errorChangingOwner: Error while changing the owner
    ownerChanged: Owner changed!
    sensitiveOperation: Sensitive operation
    validateDraft: Validate draft
    yes: Yes
    no: No
  fr:
    cancel: Annuler
    cancelDraft: Annuler le brouillon
    cancelingDraft: Annulation du brouillon
    confirmCancelDraft: Êtes-vous sûr de vouloir annuler le brouillon ? Tous les changements seront perdus et ne pourront pas être récupérés.
    changeOwner: Changer le propriétaire
    changeOwnerWarning: Changer le propriétaire d'une page peut avoir des conséquences sur les permissions.
    confirm: Confirmer
    confirmDeletePage: Voulez-vous vraiment supprimer la page "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    deletePage: Supprimer la page
    deletingPage: Suppression de la page
    editDraft: Éditer le brouillon
    errorChangingOwner: Erreur lors de le changement de propriétaire
    ownerChanged: Propriétaire changé !
    sensitiveOperation: Opération sensible
    validateDraft: Valider le brouillon
    yes: Oui
    no: Non

</i18n>
