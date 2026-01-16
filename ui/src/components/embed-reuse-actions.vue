<template>
  <!-- Undo / redo -->
  <div class="d-flex justify-center">
    <v-btn-group
      variant="tonal"
      color="primary"
      density="comfortable"
      class="mt-2 mx-2 w-100"
      divided
    >
      <v-btn
        :disabled="!changesStack.canUndo.value"
        :icon="mdiUndo"
        :title="t('undo')"
        class="flex-grow-1"
        @click="changesStack.undo()"
      />
      <v-btn
        :disabled="!changesStack.canRedo.value"
        :icon="mdiRedo"
        :title="t('redo')"
        class="flex-grow-1"
        @click="changesStack.redo()"
      />
    </v-btn-group>
  </div>

  <!-- Cancel draft -->
  <v-list-item
    :loading="cancelDraft.loading.value"
    :disabled="!hasDraftDiff"
    class="mt-2"
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

  <!-- Publication status -->
  <v-list-item>
    <p class="text-body-1">
      {{ t('publicationStatus') }}
    </p>
    <v-chip
      v-if="isPublished"
      color="success"
      size="small"
    >
      {{ t('published') }}
    </v-chip>
    <v-chip
      v-else-if="isPublicationRequested"
      color="warning"
      size="small"
    >
      {{ t('pending') }}
    </v-chip>
    <v-chip
      v-else
      color="default"
      size="small"
    >
      {{ t('notPublished') }}
    </v-chip>
  </v-list-item>

  <!-- Not published: Request publication -->
  <v-list-item
    v-if="!isPublished && !isPublicationRequested"
    :disabled="requestAction.loading.value"
    @click="requestAction.execute()"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiSend"
      />
    </template>
    {{ t('requestPublication') }}
  </v-list-item>

  <!-- Published with changes: Request validation -->
  <v-list-item
    v-else-if="isValidationPending"
    disabled
  >
    <template #prepend>
      <v-icon
        color="warning"
        :icon="mdiClockAlert"
      />
    </template>
    {{ t('validationPending') }}
  </v-list-item>

  <v-list-item
    v-else-if="isPublished && hasDraftDiff"
    :disabled="requestValidationAction.loading.value"
    @click="requestValidationAction.execute()"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiFileSync"
      />
    </template>
    {{ t('requestValidation') }}
  </v-list-item>

  <!-- Pending: Cancel request -->
  <v-list-item
    v-else-if="isPublicationRequested"
    :disabled="cancelAction.loading.value"
    @click="cancelAction.execute()"
  >
    <template #prepend>
      <v-icon
        color="warning"
        :icon="mdiClose"
      />
    </template>
    {{ t('cancelRequest') }}
  </v-list-item>

  <v-divider class="my-2" />

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
import { mdiSend, mdiFileSync, mdiClose, mdiDelete, mdiClockAlert, mdiUndo, mdiRedo, mdiFileCancel } from '@mdi/js'
import equal from 'fast-deep-equal'

const { t } = useI18n()
const router = useRouter()

const { changesStack, reuseId } = defineProps<{
  changesStack: ReturnType<typeof useChangesStack>
  reuseId: string
}>()

const { reuseFetch, reuse } = useReuseStore()
const portalId = useStringSearchParam('portalId')

const isPublished = computed(() => reuse.value?.portals?.includes(portalId.value) ?? false)
const isPublicationRequested = computed(() => reuse.value?.requestedPortals?.includes(portalId.value) ?? false)
const isValidationPending = computed(() => isPublished.value && !!reuse.value?.requestedValidationDraft)

const hasDraftDiff = computed(() => {
  if (!reuse.value) return false
  return !equal(reuse.value.config, reuse.value.draftConfig)
})

const requestAction = useAsyncAction(
  async () => {
    if (!reuse.value || !portalId.value) return
    const requestedPortals = [...reuse.value.requestedPortals]
    if (!requestedPortals.includes(portalId.value)) {
      requestedPortals.push(portalId.value)
    }
    await $fetch(`/reuses/${reuseId}`, {
      method: 'PATCH',
      body: { requestedPortals }
    })
    reuseFetch.refresh()
  },
  {
    success: t('publicationRequested'),
    error: t('errorRequestingPublication')
  }
)

const requestValidationAction = useAsyncAction(
  async () => {
    if (!reuse.value || !portalId.value || !hasDraftDiff.value) return
    const requestedPortals = reuse.value.requestedPortals
    if (!reuse.value.portals.includes(portalId.value)) requestedPortals.push(portalId.value)
    await $fetch(`/reuses/${reuseId}`, {
      method: 'PATCH',
      body: {
        requestedValidationDraft: true,
        requestedPortals
      }
    })
    reuseFetch.refresh()
  },
  {
    success: t('validationRequested'),
    error: t('errorRequestingValidation')
  }
)

const cancelAction = useAsyncAction(
  async () => {
    if (!reuse.value || !portalId.value) return
    const requestedPortals = reuse.value.requestedPortals.filter(id => id !== portalId.value)
    await $fetch(`/reuses/${reuseId}`, {
      method: 'PATCH',
      body: {
        requestedPortals,
        requestedValidationDraft: false
      }
    })
    reuseFetch.refresh()
  },
  {
    success: t('requestCancelled'),
    error: t('errorCancellingRequest')
  }
)

const deleteReuse = useAsyncAction(async () => {
  await $fetch(`/reuses/${reuseId}`, { method: 'DELETE' })
  router.push('/reuses')
})

const cancelDraft = useAsyncAction(
  async () => {
    await $fetch(`/reuses/${reuseId}/draft`, { method: 'DELETE' })
    reuseFetch.refresh()
  },
  {
    success: t('draftCanceled'),
    error: t('errorCancelingDraft')
  }
)

</script>

<i18n lang="yaml">
  en:
    publicationStatus: Publication status
    published: Published
    pending: Pending publication request
    validationPending: Validation pending
    notPublished: Not published
    requestPublication: Request publication
    requestValidation: Request validation of changes
    cancelRequest: Cancel request
    undo: Undo last change
    redo: Redo last change
    deleteReuse: Delete reuse
    deletingReuse: Deleting reuse
    confirmDeleteReuse: Do you really want to delete the reuse "{title}"? Deletion is permanent and data cannot be recovered.
    yes: 'Yes'
    no: 'No'
    publicationRequested: Publication request sent
    validationRequested: Validation request sent
    errorRequestingPublication: Error while requesting publication
    errorRequestingValidation: Error while requesting validation
    requestCancelled: Request cancelled
    errorCancellingRequest: Error while cancelling request
    errorDeleting: Error while deleting the reuse
    cancelDraft: Cancel all changes
    draftCanceled: Changes canceled!
    errorCancelingDraft: Error while canceling changes

  fr:
    publicationStatus: Statut de publication
    published: Publié
    pending: Demande de publication en attente
    validationPending: Validation en attente
    notPublished: Non publié
    requestPublication: Demander la publication
    requestValidation: Demander la validation des modifications
    cancelRequest: Annuler la demande
    undo: Annuler le dernier changement
    redo: Rétablir le dernier changement
    deleteReuse: Supprimer la réutilisation
    deletingReuse: Suppression de la réutilisation
    confirmDeleteReuse: Voulez-vous vraiment supprimer la réutilisation "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    yes: 'Oui'
    no: 'Non'
    publicationRequested: Demande de publication envoyée
    validationRequested: Demande de validation envoyée
    errorRequestingPublication: Erreur lors de la demande de publication
    errorRequestingValidation: Erreur lors de la demande de validation
    requestCancelled: Demande annulée
    errorCancellingRequest: Erreur lors de l'annulation de la demande
    errorDeleting: Erreur lors de la suppression de la réutilisation
    cancelDraft: Annuler toutes les modifications
    draftCanceled: Modifications annulées !
    errorCancelingDraft: Erreur lors de l'annulation des modifications
</i18n>
