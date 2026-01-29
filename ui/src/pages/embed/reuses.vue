<template>
  <v-container
    max-width="600"
    data-iframe-height
  >
    <h1 class="text-h4 mt-4">
      <v-icon
        size="large"
        color="primary"
        style="top:-2px"
        :icon="mdiPageNext"
      />
      {{ t('myReuses') }}
    </h1>
    <p class="my-4">
      {{ t('reuseDescription') }}
    </p>

    <!-- Drafts -->
    <v-card
      class="mb-4"
      :title="t('draftSection')"
    >
      <v-card-text>
        <!-- Create button -->
        <v-btn
          block
          color="primary"
          class="mb-4"
          :loading="createReuse.loading.value"
          @click="createReuse.execute()"
        >
          {{ t('createNew') }}
        </v-btn>

        <!-- List of drafts -->
        <template v-if="draftReuses.length">
          <v-card
            v-for="(reuse, i) in draftReuses"
            :key="reuse._id"
            :class="{ 'mb-2': i !== draftReuses.length - 1 }"
            :title="reuse.draftConfig?.title || t('untitled')"
            :subtitle="`${t('lastModified')} : ${dayjs(reuse.updatedAt).format('L')}`"
          >
            <v-card-text v-if="editingReuseId === reuse._id">
              <v-form v-model="formValid">
                <v-defaults-provider :defaults="{ global: { hideDetails: 'auto' } }">
                  <vjsf-reuse-config
                    v-model="reuse.draftConfig"
                    :locale="locale"
                    :options="vjsfOptions"
                  >
                    <template #image-upload="{ node, statefulLayout, width, height, label }">
                      <image-upload
                        :model-value="node.data"
                        :label="label"
                        :width="width"
                        :height="height"
                        :resource="{ type: 'reuse', _id: reuse._id }"
                        @update:model-value="(data: any) => statefulLayout.input(node, data)"
                      />
                    </template>
                  </vjsf-reuse-config>
                </v-defaults-provider>
              </v-form>
            </v-card-text>

            <v-card-actions
              style="min-height: auto"
              class="pt-0"
            >
              <v-spacer />

              <template v-if="editingReuseId === reuse._id">
                <v-btn
                  size="small"
                  :disabled="saveReuse.loading.value"
                  @click="cancelEdit()"
                >
                  {{ t('cancel') }}
                </v-btn>
                <v-btn
                  size="small"
                  variant="elevated"
                  color="primary"
                  :disabled="!formValid"
                  :loading="saveReuse.loading.value"
                  @click="saveReuse.execute()"
                >
                  {{ t('save') }}
                </v-btn>
              </template>

              <template v-else>
                <!-- Edit -->
                <v-btn
                  size="small"
                  variant="text"
                  color="primary"
                  @click="editingReuseId = reuse._id"
                >
                  {{ t('edit') }}
                </v-btn>

                <!-- Delete -->
                <v-menu
                  :close-on-content-click="false"
                  max-width="500"
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="small"
                      variant="text"
                      color="warning"
                      :loading="deleteReuse.loading.value && currentReuseId === reuse._id"
                    >
                      {{ t('delete') }}
                    </v-btn>
                  </template>
                  <template #default="{ isActive }">
                    <v-card
                      variant="elevated"
                      :title="t('deletingReuse')"
                      :text="t('confirmDeleteReuse', { title: reuse.draftConfig?.title })"
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
                          @click="deleteReuse.execute(reuse._id)"
                        >
                          {{ t('yes') }}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-menu>

                <!-- Submit -->
                <v-menu
                  :close-on-content-click="false"
                  max-width="500"
                >
                  <template #activator="{ props }">
                    <v-btn
                      size="small"
                      variant="text"
                      color="success"
                      :loading="submitReuse.loading.value && currentReuseId === reuse._id"
                      v-bind="props"
                    >
                      {{ t('submit') }}
                    </v-btn>
                  </template>
                  <template #default="{ isActive }">
                    <v-card :title="t('submittingReuse')">
                      <v-card-text>
                        <p class="mb-2">
                          {{ t('submitConfirm.line1') }}
                        </p>
                        <v-alert
                          variant="outlined"
                          color="warning"
                        >
                          <strong>{{ t('submitConfirm.line2') }}</strong>
                          <ul class="text-body-2 pl-4 mt-2">
                            <li class="mb-1">
                              <strong>{{ t('submitConfirm.line3.label') }}</strong> {{ t('submitConfirm.line3.body') }}
                            </li>
                            <li class="text-info mb-1">
                              <strong>{{ t('submitConfirm.line4.label') }}</strong> {{ t('submitConfirm.line4.body') }}
                            </li>
                            <li class="text-info">
                              <strong>{{ t('submitConfirm.line5.label') }}</strong> {{ t('submitConfirm.line5.body') }}
                            </li>
                          </ul>
                          <p class="text-info mt-2 text-body-2">
                            {{ t('submitConfirm.line6') }}
                          </p>
                        </v-alert>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn
                          :disabled="submitReuse.loading.value"
                          @click="isActive.value = false"
                        >
                          {{ t('cancel') }}
                        </v-btn>
                        <v-btn
                          color="success"
                          variant="flat"
                          :loading="submitReuse.loading.value"
                          @click="submitReuse.execute(reuse._id)"
                        >
                          {{ t('submitButton') }}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-menu>
              </template>
            </v-card-actions>
          </v-card>
        </template>

        <!-- Empty state -->
        <div
          v-else
          class="text-center text-medium-emphasis text-caption py-6"
        >
          {{ t('noDrafts') }}
        </div>
      </v-card-text>
    </v-card>

    <!-- Submissions -->
    <v-card :title="t('submittedSection')">
      <v-card-text>
        <!-- List of submissions -->
        <template v-if="submittedReuses.length">
          <v-card
            v-for="(reuse, i) in submittedReuses"
            :key="reuse._id"
            :class="{ 'mb-2': i !== submittedReuses.length - 1 }"
            :title="reuse.config.title"
            :subtitle="`${t('submittedOn')} : ${dayjs(reuse.createdAt).format('L')}`"
          >
            <template #append>
              <v-chip
                size="small"
                :color="getStatusColor(getSubmissionStatus(reuse))"
                :text="t(`status.${getSubmissionStatus(reuse)}`)"
              />
            </template>
          </v-card>
        </template>

        <!-- Empty state -->
        <div
          v-else
          class="text-center text-medium-emphasis text-caption py-6"
        >
          {{ t('noSubmitted') }}
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { mdiPageNext } from '@mdi/js'
import type { Options as VjsfOptions } from '@koumoul/vjsf'
import type { Reuse } from '#api/types/reuse/index'

const { t, locale } = useI18n()
const { dayjs } = useLocaleDayjs()

// Fetch draft reuses (owned by user)
const draftReusesFetch = useFetch<{ results: Reuse[], count: number }>($apiPath + '/reuses?size=100')
const draftReuses = ref<Reuse[]>([])
watch(() => draftReusesFetch.data.value?.results, (results) => {
  if (results) draftReuses.value = results
}, { immediate: true })

// Fetch submitted reuses (submitted by user)
const submittedReusesFetch = useFetch<{ results: Reuse[], count: number }>($apiPath + '/reuses?isSubmitter=true&size=100')
const submittedReuses = computed<Reuse[]>(() => submittedReusesFetch.data.value?.results || [])

const portalId = useStringSearchParam('portalId')

/** Id of the reuse currently being edited */
const editingReuseId = ref<string | null>(null)
/** Id of a newly created reuse that hasn't been saved yet (will be deleted on cancel) */
const creatingReuseId = ref<string | null>(null)
/** Id of the reuse currently being submitted or deleted to show loader only on that one */
const currentReuseId = ref<string | null>(null)
const formValid = ref(false)
const vjsfOptions = computed<VjsfOptions>(() => ({
  titleDepth: 4,
  density: 'compact',
  updateOn: 'blur',
  initialValidation: 'always',
  context: { isEmbed: true }
}))

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error'
  }
  return colors[status] || 'default'
}

const getSubmissionStatus = (reuse: Reuse) => {
  const pid = reuse.submitter?.portalId
  if (!pid) return 'rejected'
  if (reuse.portals?.includes(pid)) return 'accepted'
  if (reuse.requestedPortals?.includes(pid)) return 'pending'
  return 'rejected'
}

const createReuse = useAsyncAction(async () => {
  // Create a minimal reuse with empty title to get an ID
  const newReuse = await $fetch<Reuse>('/reuses', {
    method: 'POST',
    body: { config: { title: '' } }
  })
  await draftReusesFetch.refresh() // Refresh the list to include the new reuse
  creatingReuseId.value = newReuse._id // Track as newly created so cancel can delete it
  editingReuseId.value = newReuse._id // Start editing the newly created reuse
})

const submitReuse = useAsyncAction(async (reuseId: string) => {
  currentReuseId.value = reuseId
  try {
    await $fetch(`/reuses/${reuseId}/submit`, {
      method: 'POST',
      body: { portalId: portalId.value }
    })
    await draftReusesFetch.refresh()
    await submittedReusesFetch.refresh()
  } finally {
    currentReuseId.value = null
  }
})

const deleteReuse = useAsyncAction(async (reuseId: string) => {
  currentReuseId.value = reuseId
  try {
    await $fetch(`/reuses/${reuseId}`, { method: 'DELETE' })
    // Clear creating flag if we're deleting the reuse being created
    if (creatingReuseId.value === reuseId) creatingReuseId.value = null
    await draftReusesFetch.refresh()
  } finally {
    currentReuseId.value = null
  }
})

const saveReuse = useAsyncAction(async () => {
  if (!editingReuseId.value) return

  const reuse = draftReuses.value.find(r => r._id === editingReuseId.value)
  if (!reuse) return

  await $fetch(`/reuses/${editingReuseId.value}`, {
    method: 'PATCH',
    body: { draftConfig: reuse.draftConfig }
  })

  // No longer a new reuse after first save
  creatingReuseId.value = null
  editingReuseId.value = null
  await draftReusesFetch.refresh()
})

// Cancel editing and revert changes by refreshing from API
// If cancelling a newly created reuse, delete it
const cancelEdit = async () => {
  if (creatingReuseId.value) {
    // Delete the newly created reuse that was never saved
    await $fetch(`/reuses/${creatingReuseId.value}`, { method: 'DELETE' })
    creatingReuseId.value = null
  }
  editingReuseId.value = null
  await draftReusesFetch.refresh()
}

</script>

<i18n lang="yaml">
  en:
    cancel: Cancel
    confirmDeleteReuse: Do you really want to delete the reuse "{title}"? Deletion is permanent and data cannot be recovered.
    create: Create
    createNew: Create a new reuse
    createNewReuse: New reuse
    delete: Delete
    deletingReuse: Deleting reuse
    draftSection: Workspace
    edit: Edit
    lastModified: Last modified
    myReuses: My Reuses
    no: No
    noDrafts: No draft reuses yet. Create one to get started!
    noSubmitted: No submitted reuses yet.
    reuseDescription: Share with the community your projects and applications made from the data available on this portal.
    save: Save
    status:
      accepted: Accepted
      pending: Pending
      rejected: Rejected
    submit: Submit
    submitButton: Submit
    submitConfirm:
      line1: Do you want to send this reuse for validation?
      line2: "Warning! Before submitting, please note the following points:"
      line3:
        body: You will no longer be able to modify or delete this content directly from your personal space.
        label: "Editing lock:"
      line4:
        body: The portal administrator may adjust content to finalize publication.
        label: "Moderation:"
      line5:
        body: You will be able to follow the status of your submission (Pending, Accepted or Rejected) in the submissions section.
        label: "Tracking:"
      line6: For any modification request after sending, you must contact the portal team via the contact form.
    submittedOn: Submitted
    submittedSection: Submissions
    submittingReuse: Submit reuse for validation
    untitled: Untitled reuse
    yes: Yes

  fr:
    cancel: Annuler
    confirmDeleteReuse: Voulez-vous vraiment supprimer la réutilisation "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    create: Créer
    createNew: Créer une nouvelle réutilisation
    createNewReuse: Nouvelle réutilisation
    delete: Supprimer
    deletingReuse: Suppression de la réutilisation
    draftSection: Espace de travail
    edit: Éditer
    lastModified: Dernière modification
    myReuses: Mes réutilisations
    no: Non
    noDrafts: Pas de brouillons pour le moment. Créez-en un pour commencer !
    noSubmitted: Aucune réutilisation soumise pour le moment.
    reuseDescription: Partagez à la communauté vos projets et applications réalisés à partir des données présentes sur ce portail.
    save: Enregistrer
    status:
      accepted: Acceptée
      pending: En attente
      rejected: Rejetée
    submit: Soumettre
    submitButton: Soumettre
    submitConfirm:
      line1: Souhaitez-vous envoyer cette réutilisation pour validation ?
      line2: "Attention ! Avant de soumettre, veuillez noter les points suivants :"
      line3:
        body: Vous ne pourrez plus modifier ou supprimer directement ce contenu depuis votre espace personnel.
        label: "Verrouillage de l'édition :"
      line4:
        body: L'administrateur du portail pourra apporter des ajustements pour finaliser la mise en ligne.
        label: "Modération :"
      line5:
        body: Vous pourrez suivre l'état de votre soumission (En attente, Acceptée ou Refusée) dans la section soumissions.
        label: "Suivi :"
      line6: Pour toute demande de modification après l'envoi, vous devrez contacter l'équipe du portail via le formulaire de contact.
    submittedOn: Soumise
    submittedSection: Soumissions
    submittingReuse: Soumettre la réutilisation pour validation
    untitled: Réutilisation sans titre
    yes: Oui
</i18n>
