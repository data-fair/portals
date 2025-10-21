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
        <v-stepper-item
          :title="t('selectAction')"
          value="action"
          :color="step === 'action' ? 'primary' : ''"
          :complete="actionType !== undefined"
          editable
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
        <v-divider />
        <v-stepper-item
          value="information"
          :title="t('portalInformation')"
          :color="step === 'information' ? 'primary' : ''"
          :editable="actionType === 'blank' || selectedPageId !== undefined"
          :icon="mdiTextBox"
        />
      </v-stepper-header>

      <v-stepper-window>
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

            <!-- Duplicate existing page card (only if home pages exist) -->
            <v-col
              v-if="homePagesUserFetch.data.value?.results?.length"
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

        <!-- Step 3: Portal information -->
        <v-stepper-window-item value="information">
          <v-form v-model="valid">
            <v-text-field
              v-model="newPortalTitle"
              :label="t('portalTitle')"
              :rules="[v => !!v || t('portalTitleRequired')]"
              hide-details="auto"
              autofocus
              required
            />
            <v-checkbox
              v-model="newPortalStaging"
              density="comfortable"
              :label="t('portalStaging')"
              hide-details
            />
          </v-form>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions
        v-if="step !== 'action'"
        :prev-text="t('previous')"
        @click:prev="goToPreviousStep()"
      >
        <template #next>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="isNextButtonDisabled"
            :loading="createPortal.loading.value"
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
import type { Portal } from '#api/types/portal'
import type { Page } from '#api/types/page/index.ts'

import { mdiFile, mdiPlaylistEdit, mdiTextBox } from '@mdi/js'

const session = useSessionAuthenticated()
const router = useRouter()
const { t } = useI18n()

const step = ref<'action' | 'source' | 'information'>('action')
const actionType = ref<'blank' | 'reference' | 'duplicate' | undefined>(undefined)
const selectedPageId = ref<string | undefined>(undefined)
const newPortalTitle = ref<string>('')
const newPortalStaging = ref<boolean>(false)
const valid = ref(false)

// Fetch reference home pages (isReference: true, type: home)
const referencesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'home', isReference: true }, notifError: false }
)

// Fetch user's home pages for duplication
const homePagesUserFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'home' }, notifError: false }
)

// Pages list for step 2 (references or user pages)
const pagesListForStep2 = computed(() => {
  if (actionType.value === 'reference') return referencesFetch.data.value?.results || []
  if (actionType.value === 'duplicate') return homePagesUserFetch.data.value?.results || []
  return []
})

const isNextButtonDisabled = computed(() => {
  if (step.value === 'source') return selectedPageId.value === undefined
  if (step.value === 'information') return !valid.value || !newPortalTitle.value
  return false
})

const selectAction = (type: 'blank' | 'reference' | 'duplicate') => {
  actionType.value = type
  selectedPageId.value = undefined

  if (type === 'blank') {
    // Skip source step, go directly to information
    step.value = 'information'
  } else {
    // Go to source step to select a page
    step.value = 'source'
  }
}

const selectPage = (pageId: string) => {
  selectedPageId.value = pageId
  step.value = 'information' // Go to information step
}

const goToPreviousStep = () => {
  if (step.value === 'source') {
    step.value = 'action'
  } else if (step.value === 'information') {
    if (actionType.value === 'blank') step.value = 'action'
    else step.value = 'source'
  }
}

const goToNextStep = () => {
  if (step.value === 'information') createPortal.execute()
  else if (step.value === 'source') step.value = 'information'
}

const createPortal = useAsyncAction(
  async () => {
    if (!newPortalTitle.value) return

    // Step 1: Create the portal
    const portal = await $fetch<Portal>($apiPath + '/portals', {
      method: 'POST',
      body: {
        staging: newPortalStaging.value,
        config: { title: newPortalTitle.value }
      }
    })

    // Step 2: Find the selected page (reference or to duplicate) to get elements
    let sourceElements: any[] = []
    if (actionType.value === 'reference' && selectedPageId.value) {
      const referencePage = referencesFetch.data.value?.results.find(p => p._id === selectedPageId.value)
      sourceElements = referencePage ? referencePage.config.elements : []
    } else if (actionType.value === 'duplicate' && selectedPageId.value) {
      const pageToDuplicate = homePagesUserFetch.data.value?.results.find(p => p._id === selectedPageId.value)
      sourceElements = pageToDuplicate ? pageToDuplicate.config.elements : []
    }

    // Step 3: Create the home page with portals array containing the portal id
    await $fetch($apiPath + '/pages', {
      method: 'POST',
      body: {
        owner: session.state.account,
        type: 'home',
        portals: [portal._id],
        config: {
          title: t('home') + ' - ' + newPortalTitle.value,
          elements: sourceElements
        }
      }
    })

    // Redirect to the portal page
    await router.push({ path: `/portals/${portal._id}` })
  },
  {
    error: t('errorCreatingPortal')
  }
)

setBreadcrumbs([
  { text: t('portals'), to: '/portals' },
  { text: t('createPortal') }
])

</script>

<i18n lang="yaml">
  en:
    portals: Portals
    blankPage: Blank Page
    blankPageDescription: Start with an empty home page
    referenceTemplate: Reference Template
    referenceTemplateDescription: Use a reference home page template as a model
    duplicatePage: Duplicate Existing Page
    duplicatePageDescription: Copy an existing home page
    create: Create
    createPortal: Create a portal
    errorCreatingPortal: Error while creating the portal
    home: Home
    portalInformation: Portal information
    next: Next
    portalTitle: Portal title
    portalTitleRequired: Portal title is required
    portalStaging: Pre-production portal
    previous: Previous
    selectAction: Choose home page option
    selectReference: Select a reference template
    selectPageToDuplicate: Select a page to duplicate

  fr:
    portals: Portails
    blankPage: Page blanche
    blankPageDescription: Commencer avec une page d'accueil vide
    referenceTemplate: Modèle de référence
    referenceTemplateDescription: Utiliser un modèle de page d'accueil de référence
    duplicatePage: Dupliquer une page existante
    duplicatePageDescription: Copier une page d'accueil existante
    create: Créer
    createPortal: Créer un portail
    errorCreatingPortal: Erreur lors de la création du portail
    home: Accueil
    portalInformation: Informations du portail
    next: Suivant
    portalTitle: Titre du portail
    portalTitleRequired: Le titre du portail est requis
    portalStaging: Portail de pré-production
    previous: Précédent
    selectAction: Choisir une option de page d'accueil
    selectReference: Sélectionner un modèle de référence
    selectPageToDuplicate: Sélectionner une page à dupliquer

</i18n>
