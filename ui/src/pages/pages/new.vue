<template>
  <v-container
    data-iframe-height
    class="pa-0"
    fluid
  >
    <v-stepper
      v-model="step"
      style="background-color: transparent"
      flat
    >
      <v-stepper-header>
        <v-stepper-item
          :title="t('selectPageType')"
          value="type"
          :color="step === 'type' ? 'primary' : ''"
          :complete="pageType !== undefined"
          editable
          :icon="mdiShape"
        />
        <template v-if="isGenericPage">
          <v-divider />
          <v-stepper-item
            :title="t('selectGroup')"
            value="group"
            :color="step === 'group' ? 'primary' : ''"
            :complete="selectedGroupId !== undefined"
            :editable="pageType !== undefined"
            :icon="mdiShape"
          />
        </template>
        <v-divider />
        <v-stepper-item
          :title="t('selectAction')"
          value="action"
          :color="step === 'action' ? 'primary' : ''"
          :complete="actionType !== undefined"
          :editable="pageType !== undefined && (!isGenericPage || selectedGroupId !== undefined)"
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
        <!-- Step 0: Select page type -->
        <v-stepper-window-item value="type">
          <v-row class="d-flex align-stretch">
            <!-- Generic page (first) -->
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="pageType === 'generic' ? 'primary' : ''"
                @click="selectPageType('generic')"
              >
                <template #title>
                  <span :class="pageType !== 'generic' ? 'text-primary' : ''">
                    {{ t('pageTypeTitle.generic') }}
                  </span>
                </template>
                <v-card-text>{{ t('pageTypeDesc.generic') }}</v-card-text>
              </v-card>
            </v-col>

            <!-- Standard page types -->
            <v-col
              v-for="pType in standardPageTypes"
              :key="pType"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="pageType === pType ? 'primary' : ''"
                @click="selectPageType(pType)"
              >
                <template #title>
                  <span :class="pageType !== pType ? 'text-primary' : ''">
                    {{ t('pageTypeTitle.' + pType) }}
                  </span>
                </template>
                <v-card-text>{{ t('pageTypeDesc.' + pType) }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <!-- Step 1: Select group (only for generic pages) -->
        <v-stepper-window-item
          v-if="isGenericPage"
          value="group"
        >
          <v-row class="d-flex align-stretch">
            <!-- No group option -->
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedGroupId === 'default' ? 'primary' : ''"
                @click="selectGroup('default')"
              >
                <template #title>
                  <span :class="selectedGroupId !== 'default' ? 'text-primary' : ''">
                    {{ t('defaultGroupTitle') }}
                  </span>
                </template>
              </v-card>
            </v-col>

            <!-- Custom groups -->
            <v-col
              v-for="customGroup in customGroups"
              :key="customGroup._id"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedGroupId === customGroup._id ? 'primary' : ''"
                @click="selectGroup(customGroup._id)"
              >
                <template #title>
                  <span :class="selectedGroupId !== customGroup._id ? 'text-primary' : ''">
                    {{ customGroup.title }}
                  </span>
                </template>
                <v-card-text v-if="customGroup.description">
                  {{ customGroup.description }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <!-- Step 2: Select action type -->
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

        <!-- Step 3: Select reference page or page to duplicate -->
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
                    {{ page.title }}
                  </span>
                </template>
                <v-card-text v-if="page.config.description">
                  {{ page.config.description }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <!-- Step 4: Select owner (optional) -->
        <v-stepper-window-item value="owner">
          <owner-pick
            v-model="newOwner"
            v-model:ready="ownersReady"
          />
        </v-stepper-window-item>

        <!-- Step 5: Page information -->
        <v-stepper-window-item value="information">
          <v-form
            v-model="valid"
            @submit.prevent
          >
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
        v-if="step !== 'type'"
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

import { mdiAccount, mdiFile, mdiPlaylistEdit, mdiTextBox, mdiShape } from '@mdi/js'
import { computedAsync } from '@vueuse/core'
import OwnerPick from '@data-fair/lib-vuetify/owner-pick.vue'

const session = useSessionAuthenticated()
const router = useRouter()
const { t } = useI18n()

// Fetch custom groups
const customGroupsFetch = useFetch<{ results: Array<{ _id: string, title: string, slug: string, description?: string }> }>(
  $apiPath + '/groups',
  { query: { size: 1000, select: '_id,title,slug,description' } }
)

const customGroups = computed(() => customGroupsFetch.data.value?.results || [])

// Available page types (standard types, generic is shown separately first)
const standardPageTypes = ['home', 'event', 'news', 'contact', 'privacy-policy', 'accessibility', 'legal-notice', 'cookie-policy', 'terms-of-service', 'datasets', 'applications', 'reuses']

const step = ref<'type' | 'group' | 'action' | 'source' | 'owner' | 'information'>('type')
const pageType = ref<string | undefined>(undefined)
const selectedGroupId = ref<string | undefined>(undefined)
const actionType = ref<'blank' | 'reference' | 'duplicate' | undefined>(undefined)
const selectedPageId = ref<string | undefined>(undefined)
const newTitle = ref<string>()
const newOwner = ref<Account | undefined>(session.state.account)
const ownersReady = ref(false)
const valid = ref(false)

const isGenericPage = computed(() => pageType.value === 'generic')

// Computed query for fetching pages based on selected type
const type = computed(() => {
  return pageType.value || 'generic'
})

// Fetch reference pages (isReference: true)
const referencesFetch = useFetch<{ results: Array<{ _id: string, title: string, config: { description?: string } }> }>(
  $apiPath + '/pages',
  {
    query: computed(() => ({ type: type.value, isReference: true, select: '_id,title,config.description' })),
    notifError: false,
    immediate: false
  }
)

// Fetch user's pages for duplication
const userPagesFetch = useFetch<{ results: Array<{ _id: string, title: string, config: { description?: string } }> }>(
  $apiPath + '/pages',
  {
    query: computed(() => ({ type: type.value, select: '_id,title,config.description' })),
    notifError: false,
    immediate: false
  }
)

/** `True` if the active account isn't in a department and his organization has departments */
const hasDepartments = computedAsync(async (): Promise<boolean> => {
  if (session.state.account.department || session.state.account.type === 'user') return false
  const org = await $fetch<{ departments?: any[] }>(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath }) // Fetch the organization departments
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

  if (type === 'generic') {
    // For generic pages, go to group selection
    step.value = 'group'
  } else {
    // For standard pages, go directly to action
    step.value = 'action'
    // Fetch pages for reference/duplicate options
    referencesFetch.refresh()
    userPagesFetch.refresh()
  }
}

const selectGroup = (groupId: string) => {
  selectedGroupId.value = groupId
  step.value = 'action'
  // Fetch pages for reference/duplicate options
  referencesFetch.refresh()
  userPagesFetch.refresh()
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
  if (step.value === 'group') {
    step.value = 'type'
  } else if (step.value === 'action') {
    if (isGenericPage.value) step.value = 'group'
    else step.value = 'type'
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
    if (isGenericPage.value && !selectedGroupId.value) return

    const page = await $fetch<{ _id: string }>('/pages', {
      method: 'POST',
      body: {
        owner: newOwner.value,
        type: type.value,
        sourcePageId: selectedPageId.value, // Source page ID to duplicate (optional)
        config: {
          title: newTitle.value,
          elements: [],
          genericMetadata: isGenericPage.value && selectedGroupId.value !== 'default'
            ? { group: customGroups.value.find(g => g._id === selectedGroupId.value) }
            : undefined
        }
      }
    })

    await router.replace({ path: `/pages/${page._id}/edit-config` })
  },
  {
    error: t('errorCreatingPage')
  }
)

setBreadcrumbs([
  { text: t('pages'), to: '/pages' },
  { text: t('createPage') }
])
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
    defaultGroupTitle: No Group
    information: Information
    next: Next
    pageTitle: Page title
    pageTitleRequired: Page title is required
    previous: Previous
    selectAction: Choose a source
    selectGroup: Group
    selectPageType: Page type
    selectReference: Select a reference template
    selectPageToDuplicate: Select a page to duplicate
    selectOwner: Select owner
    pageTypeTitle:
      generic: Free Page
      home: Home Page
      contact: Contact Page
      privacy-policy: Privacy Policy
      accessibility: Accessibility
      legal-notice: Legal Notice
      cookie-policy: Cookie Policy
      terms-of-service: Terms of Service
      datasets: Datasets Catalog
      applications: Applications Catalog
      reuses: Reuses Catalog
      event: Event Page
      news: News Page
    pageTypeDesc:
      generic: Create a free-form page with custom content.
      home: Create the main home page for your portal.
      contact: Create a page to allow users to contact you.
      privacy-policy: Create a page presenting your privacy policy.
      accessibility: Create a page describing your accessibility level and commitments.
      legal-notice: Create a page gathering your mandatory legal notices.
      cookie-policy: Create a page detailing the use of cookies.
      terms-of-service: Create a page presenting your terms of service.
      datasets: Create a page listing your datasets.
      applications: Create a page listing your applications.
      reuses: Create a page listing your reuses.
      event: Create an event page.
      news: Create a news page.

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
    defaultGroupTitle: Aucun groupe
    information: Informations
    next: Suivant
    pageTitle: Titre de la page
    pageTitleRequired: Le titre de la page est requis
    previous: Précédent
    selectAction: Choisir une source
    selectGroup: Groupe
    selectPageType: Type de page
    selectReference: Sélectionner un modèle de référence
    selectPageToDuplicate: Sélectionner une page à dupliquer
    selectOwner: Sélection du propriétaire
    pageTypeTitle:
      generic: Page libre
      home: Page d'accueil
      contact: Contact
      privacy-policy: Politique de confidentialité
      accessibility: Accessibilité
      legal-notice: Mentions légales
      cookie-policy: Politique de cookies
      terms-of-service: Conditions générales d'utilisation
      datasets: Catalogue de données
      applications: Catalogue de visualisations
      reuses: Catalogue de réutilisations
      event: Page d'événement
      news: Page d'actualité
    pageTypeDesc:
      generic: Créer une page libre avec du contenu personnalisé.
      home: Créer la page d'accueil principale de votre portail.
      contact: Créer une page permettant aux utilisateurs de vous contacter.
      privacy-policy: Créer une page présentant votre politique de confidentialité.
      accessibility: Créer une page décrivant votre niveau et vos engagements d'accessibilité.
      legal-notice: Créer une page regroupant vos mentions légales obligatoires.
      cookie-policy: Créer une page détaillant l'usage des cookies.
      terms-of-service: Créer une page présentant vos conditions générales d'utilisation.
      datasets: Créer une page listant vos jeux de données.
      applications: Créer une page listant vos applications.
      reuses: Créer une page listant vos réutilisations.
      event: Créer une page d'événement.
      news: Créer une page d'actualité.

</i18n>
