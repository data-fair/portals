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
  <v-menu
    v-if="isPublished"
    v-model="showCancelDraftMenu"
    :close-on-content-click="false"
    max-width="500"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        :loading="cancelDraft.loading.value"
        :disabled="!hasDraftDiff"
        class="mt-2"
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

  <!-- Published portals -->
  <p
    v-if="publishedPortalsInfo.length"
    class="text-caption font-weight-bold text-success my-2 px-2"
  >
    {{ t('publishedOn') }}
  </p>
  <v-list-item
    v-for="portal in publishedPortalsInfo"
    :key="portal._id"
    :href="portal.url + '/reuses/' + reuse?.slug"
    target="_blank"
    :title="portal.title"
    :subtitle="portal._id === portalId ? t('currentPortal') : undefined"
  >
    <template #append>
      <v-icon
        size="small"
        :icon="mdiOpenInNew"
      />
    </template>
  </v-list-item>

  <!-- Portals with pending requests -->
  <p
    v-if="requestedPortalsInfo.length"
    class="text-caption font-weight-bold text-warning my-2 px-2"
  >
    {{ t('pendingOn') }}
  </p>
  <v-list-item
    v-for="portal in requestedPortalsInfo"
    :key="portal._id"
    :href="portal.url"
    target="_blank"
    :title="portal.title"
    :subtitle="portal._id === portalId ? t('currentPortal') : undefined"
  >
    <template #append>
      <v-icon
        size="small"
        :icon="mdiOpenInNew"
      />
    </template>
  </v-list-item>

  <!-- Not published on any portal: Request publication -->
  <v-list-item
    v-if="!isPublished && !isPublicationRequested && !reuse?.portals?.length"
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

  <!-- Validation pending: Show status only -->
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

  <!-- Published on current portal with changes: Request validation -->
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
    <span>{{ t('requestValidation') }}</span>
  </v-list-item>

  <!-- Already published on other portals: Request publication on this portal -->
  <v-list-item
    v-else-if="!isPublished && !isPublicationRequested && (reuse?.portals?.length ?? 0) > 0"
    :disabled="requestAction.loading.value"
    @click="requestAction.execute()"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiSend"
      />
    </template>
    <span>{{ hasDraftDiff ? t('requestPublicationAndValidationOnPortal') : t('requestPublicationOnPortal') }}</span>
  </v-list-item>

  <!-- Pending request: Cancel request -->
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
import { mdiSend, mdiFileSync, mdiClose, mdiDelete, mdiClockAlert, mdiUndo, mdiRedo, mdiFileCancel, mdiOpenInNew } from '@mdi/js'

const { t } = useI18n()
const router = useRouter()
const showCancelDraftMenu = ref(false)

const { changesStack, reuseId } = defineProps<{
  changesStack: ReturnType<typeof useChangesStack>
  reuseId: string
}>()

const { reuseFetch, reuse, hasDraftDiff } = useReuseStore()
const portalId = useStringSearchParam('portalId')

// Fetch portal information for published and requested portals
interface PortalPublicInfo {
  _id: string
  title: string
  url: string
}

const publishedPortalsInfo = ref<PortalPublicInfo[]>([])
const requestedPortalsInfo = ref<PortalPublicInfo[]>([])

// Fetch portal info when reuse changes
watch(() => reuse.value, async (newReuse) => {
  if (!newReuse) return

  // Fetch published portals info
  if (newReuse.portals.length > 0) {
    publishedPortalsInfo.value = await Promise.all(
      newReuse.portals.map(async (portalId) => {
        try {
          const data = await $fetch<PortalPublicInfo>(`${$apiPath}/portals/${portalId}/public`)
          return data
        } catch (e) {
          console.error('Failed to fetch portal info', portalId, e)
          return { _id: portalId, title: portalId, url: '' }
        }
      })
    )
  } else {
    publishedPortalsInfo.value = []
  }

  // Fetch requested portals info
  if (newReuse.requestedPortals.length > 0) {
    requestedPortalsInfo.value = await Promise.all(
      newReuse.requestedPortals.map(async (portalId) => {
        try {
          const data = await $fetch<PortalPublicInfo>(`${$apiPath}/portals/${portalId}/public`)
          return data
        } catch (e) {
          console.error('Failed to fetch portal info', portalId, e)
          return { _id: portalId, title: portalId, url: '' }
        }
      })
    )
  } else {
    requestedPortalsInfo.value = []
  }
}, { immediate: true })

const isPublished = computed(() => reuse.value?.portals?.includes(portalId.value) ?? false)
const isPublicationRequested = computed(() => reuse.value?.requestedPortals?.includes(portalId.value) ?? false)
const isValidationPending = computed(() => isPublished.value && !!reuse.value?.requestedValidationDraft)

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
    const patchBody: Record<string, any> = { requestedPortals }
    // Only cancel validation request if there are no more requested portals AND no draft diff
    if (requestedPortals.length === 0 && !hasDraftDiff.value) {
      patchBody.requestedValidationDraft = false
    }
    await $fetch(`/reuses/${reuseId}`, {
      method: 'PATCH',
      body: patchBody
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
    await reuseFetch.refresh()
    showCancelDraftMenu.value = false
  },
  {
    success: t('draftCanceled'),
    error: t('errorCancelingDraft')
  }
)

</script>

<i18n lang="yaml">
  en:
    publishedOn: Published on
    pendingOn: Publication pending on
    currentPortal: This portal
    published: Published
    pending: Pending publication request
    validationPending: Validation of changes pending
    notPublished: Not published
    requestPublication: Request publication
    requestPublicationOnPortal: Request publication on this portal
    requestPublicationAndValidationOnPortal: Request publication on this portal and validation of changes
    requestValidation: Request validation of changes
    viewOn: View on {portalId}
    cancelRequest: Cancel publication request
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
    cancelDraft: Revert to published version
    cancelingDraft: Reverting to published version
    confirmCancelDraft: Are you sure you want to discard your changes? The content will be reverted to how it currently appears online. Your ongoing changes will be lost.
    draftCanceled: Configuration reverted!
    errorCancelingDraft: Error while reverting configuration

  fr:
    publishedOn: Publié sur
    pendingOn: En attente de publication sur
    currentPortal: Ce portail
    published: Publié
    pending: Demande de publication en attente
    validationPending: Validation des modifications en attente
    notPublished: Non publié
    requestPublication: Demander la publication
    requestPublicationOnPortal: Demander la publication sur ce portail
    requestPublicationAndValidationOnPortal: Demander la publication sur ce portail et la validation des modifications
    requestValidation: Demander la validation des modifications
    viewOn: Voir sur {portalId}
    cancelRequest: Annuler la demande de publication
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
    cancelDraft: Rétablir la version publiée
    cancelingDraft: Rétablissement de la version publiée
    confirmCancelDraft: Êtes-vous sûr de vouloir abandonner vos changements ? Le contenu sera rétabli tel qu'il apparaît actuellement en ligne. Vos changements en cours seront perdus.
    draftCanceled: Configuration rétablie !
    errorCancelingDraft:  Erreur lors de la rétablissement de la configuration
</i18n>
