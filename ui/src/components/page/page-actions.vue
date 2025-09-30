<template>
  <!-- Edit draft -->
  <v-list-item
    :to="`/pages/${groupId}/${pageId}/edit-config`"
    :title="t('editDraft')"
  >
    <template #prepend>
      <v-icon
        color="primary"
        :icon="mdiFileEdit"
      />
    </template>
  </v-list-item>

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
  <v-list-item
    :loading="cancelDraft.loading.value"
    :disabled="validateDraft.loading.value || !hasDraftDiff"
    :title="t('cancelDraft')"
    @click="cancelDraft.execute()"
  >
    <template #prepend>
      <v-icon
        color="warning"
        :icon="mdiFileCancel"
      />
    </template>
  </v-list-item>

  <v-divider class="my-2" />

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
        :text="t('confirmDeletePage', { title: pageFetch.data.value?.title })"
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
import { mdiFileEdit, mdiFileReplace, mdiFileCancel, mdiDelete } from '@mdi/js'

const { t } = useI18n()
const { pageFetch, hasDraftDiff } = usePageStore()
const router = useRouter()

const { groupId, pageId } = defineProps<{ groupId: string, pageId: string }>()

const validateDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}/draft`, { method: 'POST' })
  await pageFetch.refresh()
})

const cancelDraft = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}/draft`, { method: 'DELETE' })
  await pageFetch.refresh()
})

const deletePage = useAsyncAction(async () => {
  await $fetch(`pages/${pageId}`, { method: 'DELETE' })
  router.push(`/pages/${groupId}`)
})

</script>

<i18n lang="yaml">
  en:
    confirmDeletePage: Do you really want to delete the page "{title}"? Deletion is permanent and data cannot be recovered.
    deletePage: Delete page
    deletingPage: Deleting page
    editDraft: Edit draft
    validateDraft: Validate draft
    cancelDraft: Cancel draft
    yes: Yes
    no: No
  fr:
    confirmDeletePage: Voulez-vous vraiment supprimer la page "{title}" ? La suppression est définitive et les données ne pourront pas être récupérées.
    deletePage: Supprimer la page
    deletingPage: Suppression de la page
    editDraft: Éditer le brouillon
    validateDraft: Valider le brouillon
    cancelDraft: Annuler le brouillon
    yes: Oui
    no: Non

</i18n>
