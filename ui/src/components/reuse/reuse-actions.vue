<template>
  <!-- Edit config -->
  <v-list-item
    :to="`/reuses/${reuseId}/edit-config`"
    :title="t('editConfig')"
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

  <!-- Delete reuse -->
  <v-menu
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :loading="deleteReuse.loading.value"
        :title="t('deleteReuse')"
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
        :title="t('deletingReuse')"
        :text="t('confirmDeleteReuse', { title: reuseFetch.data.value?.config.title })"
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
import { mdiAccount, mdiFileEdit, mdiDelete } from '@mdi/js'
import ownerPick from '@data-fair/lib-vuetify/owner-pick.vue'
import { computedAsync } from '@vueuse/core'

const { t } = useI18n()
const { reuseFetch } = useReuseStore()
const session = useSessionAuthenticated()
const router = useRouter()
const showChangeOwnerMenu = ref(false)

const ownersReady = ref(false)
const newOwner = ref<Record<string, string> | null>(null)

const { reuseId } = defineProps<{ reuseId: string }>()

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
    changeOwner: Change owner
    changeOwnerWarning: Changing the owner of a reuse may have consequences on permissions.
    confirm: Confirm
    confirmDeleteReuse: Do you really want to delete the reuse "{title}"? Deletion is permanent and data cannot be recovered.
    deleteReuse: Delete reuse
    deletingReuse: Deleting reuse
    editConfig: Edit config
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
    confirmDeleteReuse: Voulez-vous vraiment supprimer la réutilisation "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    deleteReuse: Supprimer la réutilisation
    deletingReuse: Suppression de la réutilisation
    editConfig: Éditer la configuration
    errorChangingOwner: Erreur lors de le changement de propriétaire
    ownerChanged: Propriétaire changé !
    sensitiveOperation: Opération sensible
    yes: Oui
    no: Non

</i18n>
