<template>
  <!-- Edit use -->
  <v-list-item
    :to="`/uses/${useId}/edit-config`"
    :title="t('editUse')"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiFileEdit"
      />
    </template>
  </v-list-item>

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

  <!-- Delete use -->
  <v-menu
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :loading="deleteUse.loading.value"
        :title="t('deleteUse')"
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
        :title="t('deletingUse')"
        :text="t('confirmDeleteUse', { title: useFetch.data.value?.config.title })"
        :loading="deleteUse.loading.value ? 'warning' : undefined"
      >
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="deleteUse.loading.value"
            @click="isActive.value = false"
          >
            {{ t('no') }}
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="deleteUse.loading.value"
            @click="deleteUse.execute()"
          >
            {{ t('yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-menu>
</template>

<script setup lang="ts">
import { mdiAccount, mdiFileEdit, mdiDelete } from '@mdi/js'
import ownerPick from '@data-fair/lib-vuetify/owner-pick.vue'
import { computedAsync } from '@vueuse/core'

const { t } = useI18n()
const { useFetch } = useUseStore()
const session = useSessionAuthenticated()
const router = useRouter()
const showChangeOwnerMenu = ref(false)

const ownersReady = ref(false)
const newOwner = ref<Record<string, string> | null>(null)

const { useId } = defineProps<{ useId: string }>()

const changeOwner = useAsyncAction(
  async () => {
    await $fetch($apiPath + `/uses/${useId}`, {
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

const deleteUse = useAsyncAction(async () => {
  await $fetch($apiPath + `/uses/${useId}`, { method: 'DELETE' })
  router.push('/uses')
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
    changeOwner: Change owner
    changeOwnerWarning: Changing the owner of a use may have consequences on permissions.
    confirm: Confirm
    confirmDeleteUse: Do you really want to delete the use "{title}"? Deletion is permanent and data cannot be recovered.
    deleteUse: Delete use
    deletingUse: Deleting use
    editUse: Edit use
    errorChangingOwner: Error while changing the owner
    ownerChanged: Owner changed!
    sensitiveOperation: Sensitive operation
    yes: Yes
    no: No
  fr:
    cancel: Annuler
    changeOwner: Changer le propriétaire
    changeOwnerWarning: Changer le propriétaire d'une réutilisation peut avoir des conséquences sur les permissions.
    confirm: Confirmer
    confirmDeleteUse: Voulez-vous vraiment supprimer la réutilisation "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    deleteUse: Supprimer la réutilisation
    deletingUse: Suppression de la réutilisation
    editUse: Éditer la réutilisation
    errorChangingOwner: Erreur lors de le changement de propriétaire
    ownerChanged: Propriétaire changé !
    sensitiveOperation: Opération sensible
    yes: Oui
    no: Non

</i18n>
