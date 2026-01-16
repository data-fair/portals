<template>
  <!-- Create new reuse menu -->
  <v-menu
    v-model="showCreateMenu"
    :close-on-content-click="false"
    location="bottom"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="props"
        link
      >
        <template #prepend>
          <v-icon
            color="primary"
            :icon="mdiPlusCircle"
          />
        </template>
        {{ t('createNewReuse') }}
      </v-list-item>
    </template>

    <v-card
      min-width="300"
      max-width="400"
    >
      <v-card-title>{{ t('createNewReuse') }}</v-card-title>
      <v-card-text>
        <v-form v-model="valid">
          <v-text-field
            v-model="newReuseTitle"
            :label="t('reuseTitle')"
            :rules="[v => !!v || t('reuseTitleRequired')]"
            hide-details="auto"
            autofocus
            required
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="showCreateMenu = false"
        >
          {{ t('cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!valid || !newReuseTitle"
          :loading="createReuse.loading.value"
          @click="handleCreate"
        >
          {{ t('create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>

  <!-- Search field -->
  <v-text-field
    v-model="search"
    :append-inner-icon="mdiMagnify"
    :label="t('search')"
    class="mt-4 mx-4"
    color="primary"
    density="compact"
    variant="outlined"
    autofocus
    hide-details
    clearable
  />
</template>

<script setup lang="ts">
import type { Reuse } from '#api/types/reuse/index'
import { mdiMagnify, mdiPlusCircle } from '@mdi/js'

const { t } = useI18n()
const router = useRouter()
const portalId = useStringSearchParam('portalId')
const session = useSessionAuthenticated()

const search = defineModel('search', { type: String, default: '' })

const showCreateMenu = ref(false)
const newReuseTitle = ref<string>('')
const valid = ref(false)

const createReuse = useAsyncAction(
  async () => {
    if (!newReuseTitle.value || !portalId.value) return

    const reuse = await $fetch<Reuse>($apiPath + '/reuses', {
      method: 'POST',
      body: {
        portalId: portalId.value,
        submitter: {
          type: 'user',
          id: session.state.user.id,
          name: session.state.user.name
        },
        config: { title: newReuseTitle.value }
      }
    })

    showCreateMenu.value = false
    newReuseTitle.value = ''
    await router.push({ path: `/embed/reuses/${reuse._id}` })
  },
  {
    error: t('errorCreatingReuse')
  }
)

const handleCreate = () => {
  createReuse.execute()
}
</script>

<i18n lang="yaml">
  en:
    createNewReuse: Create a new reuse
    search: Search
    reuseTitle: Reuse title
    reuseTitleRequired: Reuse title is required
    cancel: Cancel
    create: Create
    errorCreatingReuse: Error while creating the reuse

  fr:
    createNewReuse: Créer une nouvelle réutilisation
    search: Rechercher
    reuseTitle: Titre de la réutilisation
    reuseTitleRequired: Le titre de la réutilisation est requis
    cancel: Annuler
    create: Créer
    errorCreatingReuse: Erreur lors de la création de la réutilisation
</i18n>
