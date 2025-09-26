<template>
  <v-list-item
    :disabled="isSavingDraft || !hasDraftDiff"
    :loading="validateDraft.loading.value"
    @click="validateDraft.execute()"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiFileReplace"
      />
    </template>
    {{ t('validateDraft') }}
  </v-list-item>

  <v-list-item
    :disabled="isSavingDraft || !hasDraftDiff"
    :loading="cancelDraft.loading.value"
    @click="cancelDraft.execute()"
  >
    <template #prepend>
      <v-icon
        color="warning"
        :icon="mdiFileCancel"
      />
    </template>
    {{ t('cancelDraft') }}
  </v-list-item>

  <v-divider class="my-2" />

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
        {{ t('confirmDeletePortal', { title: portalTitle }) }}
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

  <v-list-item
    v-if="session.state.user?.adminMode"
    :to="`/portals/${route.params.id}/ingress`"
  >
    <template #prepend>
      <v-icon
        color="admin"
        :icon="mdiShieldLinkVariant"
      />
    </template>
    {{ t('manageDomainExposure') }}
  </v-list-item>

  <v-list-item
    :href="$uiConfig.draftUrlPattern.replace('{id}', route.params.id)"
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
    v-if="portalUrl"
    :href="portalUrl"
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
import { mdiFileReplace, mdiFileExport, mdiFileCancel, mdiOpenInNew, mdiShieldLinkVariant } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const route = useRoute<'/portals/[id]/'>()
const router = useRouter()
const showDeleteMenu = ref(false)

const emit = defineEmits<{ (e: 'refresh-portal'): void }>()
defineProps<{
  hasDraftDiff: boolean
  isSavingDraft: boolean
  portalTitle: string
  portalUrl: string | undefined
}>()

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'DELETE' })
  emit('refresh-portal')
})

const validateDraft = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}/draft`, { method: 'POST' })
  emit('refresh-portal')
})

const deletePortal = useAsyncAction(async () => {
  await $fetch(`portals/${route.params.id}`, { method: 'DELETE' })
  router.replace('/portals')
}, {
  success: t('portalDeleted'),
  error: t('errorDeletingPortal'),
})

</script>

<i18n lang="yaml">
  en:
    cancelDraft: Cancel draft
    confirmDeletePortal: Do you really want to delete the portal "{title}"? Deletion is permanent and data cannot be recovered.
    deletePortal: Delete portal
    deletingPortal: Deleting portal
    errorDeletingPortal: Error while deleting the portal
    manageDomainExposure: Manage domain exposure
    no: No
    portalDeleted: Portal deleted!
    validateDraft: Validate draft
    viewDraft: View draft
    viewPortal: View portal
    yes: Yes

  fr:
    cancelDraft: Annuler le brouillon
    confirmDeletePortal: Voulez-vous vraiment supprimer le portail "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    deletePortal: Supprimer le portail
    deletingPortal: Suppression du portail
    errorDeletingPortal: Erreur lors de la suppression du portail
    manageDomainExposure: Gérer l'exposition du domaine
    no: Non
    portalDeleted: Portail supprimé !
    validateDraft: Valider le brouillon
    viewDraft: Voir le brouillon
    viewPortal: Visiter le portail
    yes: Oui

</i18n>

<style scoped>
</style>
