<template>
  <v-container
    data-iframe-height
    style="min-height:800px"
    class="pa-0"
    fluid
  >
    <v-stepper
      v-model="step"
      style="background-color: transparent"
      flat
    >
      <v-stepper-header>
        <template v-if="isStandardGroup">
          <v-stepper-item
            :title="t('selectPageType')"
            value="type"
            :color="step === 'type' ? 'primary' : ''"
            :complete="pageType !== undefined"
            editable
            :icon="mdiShape"
          />
          <v-divider />
        </template>
        <v-stepper-item
          :title="t('selectAction')"
          value="action"
          :color="step === 'action' ? 'primary' : ''"
          :complete="actionType !== undefined"
          :editable="!isStandardGroup || pageType !== undefined"
          :icon="mdiPlaylistEdit"
        />
        <template v-if="actionType === 'reference' || actionType === 'duplicate'">
          <v-divider />
          <v-stepper-item
            :title="actionType === 'reference' ? t('selectReference') : t('selectPageToDuplicate')"
            value="source"
            :color="step === 'source' ? 'primary' : ''"
            :complete="selectedPageId !== undefined"
            :editable="actionType !== undefined"
            :icon="mdiFile"
          />
        </template>
        <template v-if="hasDepartments">
          <v-divider />
          <v-stepper-item
            value="owner"
            :title="t('selectOwner')"
            :color="step === 'owner' ? 'primary' : ''"
            :editable="actionType === 'blank' || selectedPageId !== undefined"
            :icon="mdiAccount"
          />
        </template>
        <v-divider />
        <v-stepper-item
          value="information"
          :title="t('information')"
          :color="step === 'information' ? 'primary' : ''"
          :editable="actionType === 'blank' || selectedPageId !== undefined"
          :icon="mdiTextBox"
        />
      </v-stepper-header>

      <v-stepper-window>
        <!-- Step 0: Select page type (only for standard group) -->
        <v-stepper-window-item
          v-if="isStandardGroup"
          value="type"
        >
          <v-row class="d-flex align-stretch">
            <v-col
              v-for="type in pageTypes"
              :key="type.value"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="pageType === type.value ? 'primary' : ''"
                @click="selectPageType(type.value)"
              >
                <template #title>
                  <span :class="pageType !== type.value ? 'text-primary' : ''">
                    {{ t('pageTypeTitle.' + type.value) }}
                  </span>
                </template>
                <v-card-text>{{ t('pageTypeDesc.' + type.value) }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <!-- Step 1: Select action type -->
        <v-stepper-window-item value="action">
          <v-row class="d-flex align-stretch">
            <!-- Blank page card -->
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="actionType === 'blank' ? 'primary' : ''"
                @click="selectAction('blank')"
              >
                <template #title>
                  <span :class="actionType !== 'blank' ? 'text-primary' : ''">
                    {{ t('blankPage') }}
                  </span>
                </template>
                <v-card-text>{{ t('blankPageDescription') }}</v-card-text>
              </v-card>
            </v-col>

            <!-- Reference template card (only if reference pages exist) -->
            <v-col
              v-if="referencesFetch.data.value?.results?.length"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="actionType === 'reference' ? 'primary' : ''"
                @click="selectAction('reference')"
              >
                <template #title>
                  <span :class="actionType !== 'reference' ? 'text-primary' : ''">
                    {{ t('referenceTemplate') }}
                  </span>
                </template>
                <v-card-text>{{ t('referenceTemplateDescription') }}</v-card-text>
              </v-card>
            </v-col>

            <!-- Duplicate existing page card (only if user pages exist) -->
            <v-col
              v-if="userPagesFetch.data.value?.results?.length"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="actionType === 'duplicate' ? 'primary' : ''"
                @click="selectAction('duplicate')"
              >
                <template #title>
                  <span :class="actionType !== 'duplicate' ? 'text-primary' : ''">
                    {{ t('duplicatePage') }}
                  </span>
                </template>
                <v-card-text>{{ t('duplicatePageDescription') }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <!-- Step 2: Select reference page or page to duplicate -->
        <v-stepper-window-item value="source">
          <v-row class="d-flex align-stretch">
            <v-col
              v-for="page in pagesListForStep2"
              :key="page._id"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedPageId === page._id ? 'primary' : ''"
                @click="selectPage(page._id)"
              >
                <template #title>
                  <span :class="selectedPageId !== page._id ? 'text-primary' : ''">
                    {{ page.config.title }}
                  </span>
                </template>
                <v-card-text v-if="page.config.description">
                  {{ page.config.description }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <!-- Step 3: Select owner (optional) -->
        <v-stepper-window-item value="owner">
          <owner-pick
            v-model="newOwner"
            v-model:ready="ownersReady"
          />
        </v-stepper-window-item>

        <!-- Step 4: Page information -->
        <v-stepper-window-item value="information">
          <v-form v-model="valid">
            <v-text-field
              v-model="newTitle"
              :label="t('pageTitle')"
              :rules="[v => !!v || t('pageTitleRequired')]"
              hide-details="auto"
              autofocus
              required
            />
          </v-form>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions
        v-if="step !== 'type' && step !== 'action'"
        :prev-text="t('previous')"
        @click:prev="goToPreviousStep()"
      >
        <template #next>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="isNextButtonDisabled"
            :loading="createPage.loading.value"
            @click="goToNextStep()"
          >
            {{ step === 'information' ? t('create') : t('next') }}
          </v-btn>
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script setup lang="ts">
import type { Account } from '@data-fair/lib-common-types/session'
import type { Page } from '#api/types/page/index.ts'

import { mdiAccount, mdiFile, mdiPlaylistEdit, mdiTextBox, mdiShape } from '@mdi/js'
import { computedAsync } from '@vueuse/core'
import OwnerPick from '@data-fair/lib-vuetify/owner-pick.vue'

const session = useSessionAuthenticated()
const router = useRouter()
const route = useRoute<'/pages/[groupId]/new'>()
const { t } = useI18n()

const isBaseGroup = ['standard', 'event', 'news', 'default'].includes(route.params.groupId)
const isStandardGroup = route.params.groupId === 'standard'

// Available page types for standard group
const pageTypes = [
  { value: 'home', label: 'Home' },
  { value: 'contact', label: 'Contact' },
  { value: 'privacy-policy', label: 'Privacy Policy' }
]

const step = ref<'type' | 'action' | 'source' | 'owner' | 'information'>(isStandardGroup ? 'type' : 'action')
const pageType = ref<string | undefined>(undefined) // For standard group only
const actionType = ref<'blank' | 'reference' | 'duplicate' | undefined>(undefined)
const selectedPageId = ref<string | undefined>(undefined)
const newTitle = ref<string>()
const newOwner = ref<Account | undefined>(session.state.account)
const ownersReady = ref(false)
const valid = ref(false)

// Computed query for fetching pages based on selected type
const fetchQuery = computed(() => {
  const type = isStandardGroup ? pageType.value : route.params.groupId
  return { type }
})

// Fetch reference pages (isReference: true)
const referencesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: computed(() => ({ ...fetchQuery.value, isReference: true })), notifError: false }
)

// Fetch user's pages for duplication
const userPagesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: fetchQuery, notifError: false }
)

/** `True` if the active account isn't in a department and his organization has departments */
const hasDepartments = computedAsync(async (): Promise<boolean> => {
  if (session.state.account.department || session.state.account.type === 'user') return false
  const org = await $fetch(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath }) // Fetch the organization departments
  return !!org.departments?.length // Check if the organization has departments
}, false)

// Pages list for step 2 (references or user pages)
const pagesListForStep2 = computed(() => {
  if (actionType.value === 'reference') return referencesFetch.data.value?.results || []
  if (actionType.value === 'duplicate') return userPagesFetch.data.value?.results || []
  return []
})

const isNextButtonDisabled = computed(() => {
  if (step.value === 'source') return selectedPageId.value === undefined
  if (step.value === 'information') return !valid.value
  return false
})

const selectPageType = (type: string) => {
  pageType.value = type
  step.value = 'action'
}

const selectAction = (type: 'blank' | 'reference' | 'duplicate') => {
  actionType.value = type
  selectedPageId.value = undefined

  if (type === 'blank') { // Skip source step, go directly to owner or information
    step.value = hasDepartments.value ? 'owner' : 'information'
  } else { // Go to source step to select a page
    step.value = 'source'
  }
}

const selectPage = (pageId: string) => {
  selectedPageId.value = pageId
  step.value = hasDepartments.value ? 'owner' : 'information' // Go to next step (owner or information)
}

const goToPreviousStep = () => {
  if (step.value === 'action') {
    if (isStandardGroup) step.value = 'type'
  } else if (step.value === 'source') {
    step.value = 'action'
  } else if (step.value === 'owner') {
    if (actionType.value === 'blank') step.value = 'action'
    else step.value = 'source'
  } else if (step.value === 'information') {
    if (hasDepartments.value) step.value = 'owner'
    else if (actionType.value === 'blank') step.value = 'action'
    else step.value = 'source'
  }
}

const goToNextStep = () => {
  if (step.value === 'information') createPage.execute()
  else if (step.value === 'source') step.value = hasDepartments.value ? 'owner' : 'information'
  else if (step.value === 'owner') step.value = 'information'
}

const createPage = useAsyncAction(
  async () => {
    if (!newTitle.value) return

    // Find the selected page (reference or to duplicate)
    let sourceElements: any[] = []
    if (actionType.value === 'reference' && selectedPageId.value) {
      const referencePage = referencesFetch.data.value?.results.find(p => p._id === selectedPageId.value)
      sourceElements = referencePage ? referencePage.config.elements : []
    } else if (actionType.value === 'duplicate' && selectedPageId.value) {
      const pageToDuplicate = userPagesFetch.data.value?.results.find(p => p._id === selectedPageId.value)
      sourceElements = pageToDuplicate ? pageToDuplicate.config.elements : []
    }

    // Use selected pageType for standard group, otherwise use groupId
    const type = isStandardGroup ? pageType.value : route.params.groupId

    const page = await $fetch($apiPath + '/pages', {
      method: 'POST',
      body: {
        owner: newOwner.value,
        type,
        config: {
          title: newTitle.value,
          elements: sourceElements
        }
      }
    })

    await router.push({ path: `/pages/${route.params.groupId}/${page._id}` })
  },
  {
    error: t('errorCreatingPage')
  }
)

const groupFetch = useFetch<{ _id: string, title: string, slug: string }>(
  $apiPath + '/groups/' + route.params.groupId,
  { immediate: !isBaseGroup }
)

const group = computed(() => {
  if (isBaseGroup) return { _id: route.params.groupId, title: t('groupTitle.' + route.params.groupId), slug: route.params.groupId }
  return groupFetch?.data.value || { _id: route.params.groupId, title: t('groupTitle.unknown'), slug: route.params.groupId }
})

watch(group, () => {
  setBreadcrumbs([
    { text: t('pages'), to: '/pages' },
    { text: group.value?.title, to: `/pages/${route.params.groupId}` },
    { text: t('createPage') }
  ])
}, { immediate: isBaseGroup })

</script>

<i18n lang="yaml">
  en:
    pages: Pages
    blankPage: Blank Page
    blankPageDescription: Start with an empty page
    referenceTemplate: Reference Template
    referenceTemplateDescription: Use a reference page template as a model
    duplicatePage: Duplicate Existing Page
    duplicatePageDescription: Copy one of your existing pages
    configuration: Configuration
    create: Create
    createPage: Create a page
    errorCreatingPage: Error while creating the page
    groupTitle:
      standard: Standard pages
      event: Events
      news: News
      default: Other pages
      unknown: Unknown group
    information: Information
    next: Next
    pageTitle: Page title
    pageTitleRequired: Page title is required
    previous: Previous
    selectAction: Choose an option
    selectPageType: Page type
    selectReference: Select a reference template
    selectPageToDuplicate: Select a page to duplicate
    selectOwner: Select owner
    pageTypeTitle:
      home: Home Page
      contact: Contact Page
      privacy-policy: Privacy Policy
    pageTypeDesc:
      home: Create a home page for your portal
      contact: Create a contact page with your information
      privacy-policy: Create a privacy policy page

  fr:
    pages: Pages
    blankPage: Page blanche
    blankPageDescription: Commencer avec une page vide
    referenceTemplate: Modèle de référence
    referenceTemplateDescription: Utiliser un modèle de page de référence
    duplicatePage: Dupliquer une page existante
    duplicatePageDescription: Copier une de vos pages existantes
    configuration: Configuration
    create: Créer
    createPage: Créer une page
    errorCreatingPage: Erreur lors de la création de la page
    groupTitle:
      standard: Pages standard
      event: Événements
      news: Actualitées
      default: Autres pages
      unknown: Groupe inconnu
    information: Informations
    next: Suivant
    pageTitle: Titre de la page
    pageTitleRequired: Le titre de la page est requis
    previous: Précédent
    selectAction: Choisir une option
    selectPageType: Type de page
    selectReference: Sélectionner un modèle de référence
    selectPageToDuplicate: Sélectionner une page à dupliquer
    selectOwner: Sélection du propriétaire
    pageTypeTitle:
      home: Page d'accueil
      contact: Page de contact
      privacy-policy: Politique de confidentialité
    pageTypeDesc:
      home: Créer une page d'accueil pour votre portail
      contact: Créer une page de contact avec vos informations
      privacy-policy: Créer une page de politique de confidentialité

</i18n>
