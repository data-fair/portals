<template>
  <v-menu
    v-model="menu"
    location="start"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-list-item v-bind="props">
        <template #prepend>
          <v-icon
            color="primary"
            :icon="isEdit ? mdiPencil : mdiFolderPlusOutline"
          />
        </template>
        {{ isEdit ? t('editGroup') : t('createNewGroup') }}
      </v-list-item>
    </template>
    <v-card
      data-iframe-height
      min-width="300"
      rounded="lg"
      :loading="save.loading.value ? 'primary' : undefined"
    >
      <v-card-text>
        <v-select
          v-if="isEdit"
          v-model="selectedId"
          :items="groups"
          item-title="title"
          item-value="_id"
          :label="t('selectGroup')"
          density="comfortable"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="title"
          :label="t('titleLabel')"
          density="comfortable"
          variant="outlined"
          :autofocus="!isEdit"
          hide-details="auto"
          :disabled="isEdit && !selectedId"
          :class="{ 'mt-4': isEdit }"
        />
        <v-textarea
          v-model="description"
          :label="t('descriptionLabel')"
          :rules="[rules.maxLength(100)]"
          class="mt-4"
          density="comfortable"
          hide-details="auto"
          variant="outlined"
          no-resize
          rows="3"
          auto-grow
          :disabled="isEdit && !selectedId"
        />
        <v-autocomplete
          v-model="rootPage"
          :items="rootPageItems"
          item-title="display"
          item-value="slug"
          :label="t('rootPage')"
          :hint="t('rootPageHint')"
          persistent-hint
          clearable
          class="mt-4"
          density="comfortable"
          variant="outlined"
          :disabled="isEdit && !selectedId"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          :disabled="save.loading.value"
          @click="menu = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!canSave"
          :loading="save.loading.value ? 'primary' : false"
          @click="save.execute()"
        >
          {{ isEdit ? t('save') : t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import type { Group } from '#api/types/group'
import { useRules } from 'vuetify/labs/rules'
import { mdiPencil, mdiFolderPlusOutline } from '@mdi/js'

const { t } = useI18n()
const rules = useRules() // https://vuetifyjs.com/en/features/rules/

const { mode, groups = [] } = defineProps<{
  mode: 'create' | 'edit',
  groups?: Group[]
}>()
const emit = defineEmits<{ (e: 'saved'): void }>()

const isEdit = mode === 'edit'

const menu = ref(false)
const selectedId = ref<string | null>(null)
const title = ref('')
const description = ref('')
const rootPage = ref<string | null>(null)

// Standalone generic pages (without group) usable as a group's root page, fetched lazily when the menu opens
const rootPagesFetch = useFetch<{ results: Array<{ config: { title: string, genericMetadata?: { slug?: string } } }> }>(
  $apiPath + '/pages',
  {
    query: { type: 'generic', groupId: 'default', select: 'config.title,config.genericMetadata.slug', size: 1000 },
    waitFor: () => menu.value
  }
)

const rootPageItems = computed(() =>
  (rootPagesFetch.data.value?.results ?? [])
    .map(page => ({ display: page.config.title, slug: page.config.genericMetadata?.slug }))
    .filter((item): item is { display: string, slug: string } => !!item.slug)
    .sort((a, b) => a.display.localeCompare(b.display))
)

const canSave = computed(() =>
  !!title.value && description.value.length <= 100 && (!isEdit || !!selectedId.value)
)

const loadSelected = () => {
  const group = groups.find(item => item._id === selectedId.value)
  title.value = group?.title || ''
  description.value = group?.description || ''
  rootPage.value = group?.rootPage || null
}

watch(menu, (open) => {
  if (!open) return
  if (isEdit) {
    if (!selectedId.value && groups.length) selectedId.value = groups[0]._id
    loadSelected()
  } else {
    title.value = ''
    description.value = ''
    rootPage.value = null
  }
})

watch(selectedId, () => { if (isEdit) loadSelected() })

const save = useAsyncAction(
  async () => {
    const body = { title: title.value, description: description.value, rootPage: rootPage.value || '' }
    if (isEdit) {
      if (!selectedId.value) return
      await $fetch(`/groups/${selectedId.value}`, { method: 'PATCH', body })
    } else {
      await $fetch<Group>('/groups', { method: 'POST', body })
    }
    emit('saved')
    menu.value = false
  },
  {
    success: isEdit ? t('editGroupSuccess') : t('createGroupSuccess'),
    error: isEdit ? t('editGroupError') : t('createGroupError')
  }
)
</script>

<i18n lang="yaml">
  en:
    cancel: Cancel
    create: Create
    save: Save
    createNewGroup: Create a new group
    editGroup: Edit a group
    selectGroup: Select a group
    titleLabel: Group title
    descriptionLabel: Description
    rootPage: Root page
    rootPageHint: Custom page used as the group's root in the breadcrumb.
    createGroupSuccess: Group created.
    createGroupError: Error while creating the group.
    editGroupSuccess: Group updated.
    editGroupError: Error while updating the group.

  fr:
    cancel: Annuler
    create: Créer
    save: Enregistrer
    createNewGroup: Créer un nouveau groupe
    editGroup: Modifier un groupe
    selectGroup: Choisir un groupe
    titleLabel: Titre du groupe
    descriptionLabel: Description
    rootPage: Page racine
    rootPageHint: Page de contenu libre utilisée comme racine du groupe dans le fil d'Ariane.
    createGroupSuccess: Groupe créé.
    createGroupError: Erreur lors de la création du groupe.
    editGroupSuccess: Groupe modifié.
    editGroupError: Erreur lors de la modification du groupe.
</i18n>
