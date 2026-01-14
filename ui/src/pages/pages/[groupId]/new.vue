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
              v-for="pType in pageTypes"
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
        v-if="step !== 'type' && (step !== 'action' || isStandardGroup)"
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
const route = useRoute<'/pages/[groupId]/new'>()
const { t } = useI18n()

const isBaseGroup = ['standard', 'event', 'news', 'default'].includes(route.params.groupId)
const isStandardGroup = route.params.groupId === 'standard'

// Available page types for standard group
const pageTypes = ['home', 'contact', 'privacy-policy', 'accessibility', 'legal-notice', 'cookie-policy', 'terms-of-service', 'datasets', 'applications', 'reuses']

const step = ref<'type' | 'action' | 'source' | 'owner' | 'information'>(isStandardGroup ? 'type' : 'action')
const pageType = ref<string | undefined>(undefined) // For standard group only
const actionType = ref<'blank' | 'reference' | 'duplicate' | undefined>(undefined)
const selectedPageId = ref<string | undefined>(undefined)
const newTitle = ref<string>()
const newOwner = ref<Account | undefined>(session.state.account)
const ownersReady = ref(false)
const valid = ref(false)

// Computed query for fetching pages based on selected type
// For standard/event/news, use the type directly (or pageType.value for standard)
// For default and custom groups, use 'generic'
const type = computed(() => {
  let type: string
  if (route.params.groupId === 'standard' && pageType.value) type = pageType.value
  else if (route.params.groupId === 'event' || route.params.groupId === 'news') type = route.params.groupId
  else type = 'generic'
  return type
})

// Fetch reference pages (isReference: true)
const referencesFetch = useFetch<{ results: Array<{ _id: string, title: string, config: { description?: string } }> }>(
  $apiPath + '/pages',
  {
    query: computed(() => ({ type: type.value, isReference: true, select: '_id,title,config.description' })),
    notifError: false
  }
)

// Fetch user's pages for duplication
const userPagesFetch = useFetch<{ results: Array<{ _id: string, title: string, config: { description?: string } }> }>(
  $apiPath + '/pages',
  {
    query: computed(() => ({ type: type.value, select: '_id,title,config.description' })),
    notifError: false
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

    const page = await $fetch<{ _id: string }>('/pages', {
      method: 'POST',
      body: {
        owner: newOwner.value,
        type: type.value,
        sourcePageId: selectedPageId.value, // Source page ID to duplicate (optional)
        config: {
          title: newTitle.value,
          elements: [],
          genericMetadata: type.value === 'generic' && route.params.groupId !== 'default'
            ? {
                group: {
                  _id: group.value._id,
                  slug: group.value.slug,
                  title: group.value.title
                }
              }
            : undefined
        }
      }
    })

    await router.replace({ path: `/pages/${route.params.groupId}/${page._id}` })
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
    selectAction: Choose a source
    selectPageType: Page type
    selectReference: Select a reference template
    selectPageToDuplicate: Select a page to duplicate
    selectOwner: Select owner
    pageTypeTitle:
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
    pageTypeDesc:
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
      news: Actualités
      default: Autres pages
      unknown: Groupe inconnu
    information: Informations
    next: Suivant
    pageTitle: Titre de la page
    pageTitleRequired: Le titre de la page est requis
    previous: Précédent
    selectAction: Choisir une source
    selectPageType: Type de page
    selectReference: Sélectionner un modèle de référence
    selectPageToDuplicate: Sélectionner une page à dupliquer
    selectOwner: Sélection du propriétaire
    pageTypeTitle:
      home: Page d'accueil
      contact: Page de contact
      privacy-policy: Politique de confidentialité
      accessibility: Accessibilité
      legal-notice: Mentions légales
      cookie-policy: Politique de cookies
      terms-of-service: Conditions générales d'utilisation
      datasets: Catalogue de données
      applications: Catalogue d'applications
      reuses: Catalogue de réutilisations
    pageTypeDesc:
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

</i18n>
