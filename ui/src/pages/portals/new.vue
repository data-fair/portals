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
          :title="t('selectHomePageAction')"
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
          :title="t('selectCatalogAction')"
          value="catalog-action"
          :color="step === 'catalog-action' ? 'primary' : ''"
          :complete="catalogActionType !== undefined"
          :editable="actionType === 'blank' || selectedPageId !== undefined"
          :icon="mdiPlaylistEdit"
        />
        <template v-if="catalogActionType === 'reference' || catalogActionType === 'duplicate'">
          <v-divider />
          <v-stepper-item
            :title="catalogActionType === 'reference' ? t('selectCatalogReference') : t('selectCatalogToDuplicate')"
            value="catalog-source"
            :color="step === 'catalog-source' ? 'primary' : ''"
            :complete="selectedCatalogPageId !== undefined"
            :editable="catalogActionType !== undefined"
            :icon="mdiFile"
          />
        </template>
        <template v-if="hasDepartments">
          <v-divider />
          <v-stepper-item
            value="owner"
            :title="t('selectOwner')"
            :color="step === 'owner' ? 'primary' : ''"
            :editable="(actionType === 'blank' || selectedPageId !== undefined) && (catalogActionType === 'blank' || catalogActionType === 'none' || selectedCatalogPageId !== undefined)"
            :icon="mdiAccount"
          />
        </template>
        <v-divider />
        <v-stepper-item
          value="information"
          :title="t('portalInformation')"
          :color="step === 'information' ? 'primary' : ''"
          :editable="(actionType === 'blank' || selectedPageId !== undefined) && (catalogActionType === 'blank' || catalogActionType === 'none' || selectedCatalogPageId !== undefined)"
          :icon="mdiTextBox"
        />
      </v-stepper-header>

      <v-stepper-window>
        <!-- Step 1: Select action type -->
        <v-stepper-window-item value="action">
          <v-row class="d-flex align-stretch">
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

        <!-- Step 3: Select catalog action type -->
        <v-stepper-window-item value="catalog-action">
          <v-row class="d-flex align-stretch">
            <!-- No catalog option -->
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="catalogActionType === 'none' ? 'primary' : ''"
                @click="selectCatalogAction('none')"
              >
                <template #title>
                  <span :class="catalogActionType !== 'none' ? 'text-primary' : ''">
                    {{ t('noCatalog') }}
                  </span>
                </template>
                <v-card-text>{{ t('noCatalogDescription') }}</v-card-text>
              </v-card>
            </v-col>

            <!-- Reference catalog template card (only if reference pages exist) -->
            <v-col
              v-if="catalogReferencesFetch.data.value?.results?.length"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="catalogActionType === 'reference' ? 'primary' : ''"
                @click="selectCatalogAction('reference')"
              >
                <template #title>
                  <span :class="catalogActionType !== 'reference' ? 'text-primary' : ''">
                    {{ t('catalogReferenceTemplate') }}
                  </span>
                </template>
                <v-card-text>{{ t('catalogReferenceTemplateDescription') }}</v-card-text>
              </v-card>
            </v-col>

            <!-- Blank catalog page card -->
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="catalogActionType === 'blank' ? 'primary' : ''"
                @click="selectCatalogAction('blank')"
              >
                <template #title>
                  <span :class="catalogActionType !== 'blank' ? 'text-primary' : ''">
                    {{ t('blankCatalog') }}
                  </span>
                </template>
                <v-card-text>{{ t('blankCatalogDescription') }}</v-card-text>
              </v-card>
            </v-col>

            <!-- Duplicate existing catalog card (only if user catalogs exist) -->
            <v-col
              v-if="catalogPagesUserFetch.data.value?.results?.length"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="catalogActionType === 'duplicate' ? 'primary' : ''"
                @click="selectCatalogAction('duplicate')"
              >
                <template #title>
                  <span :class="catalogActionType !== 'duplicate' ? 'text-primary' : ''">
                    {{ t('duplicateCatalog') }}
                  </span>
                </template>
                <v-card-text>{{ t('duplicateCatalogDescription') }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-stepper-window-item>

        <!-- Step 4: Select catalog reference page or page to duplicate -->
        <v-stepper-window-item value="catalog-source">
          <v-row class="d-flex align-stretch">
            <v-col
              v-for="page in catalogPagesListForStep"
              :key="page._id"
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedCatalogPageId === page._id ? 'primary' : ''"
                @click="selectCatalogPage(page._id)"
              >
                <template #title>
                  <span :class="selectedCatalogPageId !== page._id ? 'text-primary' : ''">
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

        <!-- Step 5: Select owner (optional) -->
        <v-stepper-window-item value="owner">
          <owner-pick
            v-model="newOwner"
            v-model:ready="ownersReady"
          />
        </v-stepper-window-item>

        <!-- Step 6: Portal information -->
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
import type { Portal } from '#api/types/portal/index.ts'
import type { Page } from '#api/types/page/index.ts'
import type { Account } from '@data-fair/lib-common-types/session/index.js'

import { mdiAccount, mdiFile, mdiPlaylistEdit, mdiTextBox } from '@mdi/js'
import { computedAsync } from '@vueuse/core'
import OwnerPick from '@data-fair/lib-vuetify/owner-pick.vue'

const session = useSessionAuthenticated()
const router = useRouter()
const { t } = useI18n()

const step = ref<'action' | 'source' | 'catalog-action' | 'catalog-source' | 'owner' | 'information'>('action')
const actionType = ref<'blank' | 'reference' | 'duplicate' | undefined>(undefined)
const selectedPageId = ref<string | undefined>(undefined)
const catalogActionType = ref<'none' | 'blank' | 'reference' | 'duplicate' | undefined>(undefined)
const selectedCatalogPageId = ref<string | undefined>(undefined)
const newPortalTitle = ref<string>('')
const newPortalStaging = ref<boolean>(false)
const newOwner = ref<Account | undefined>(session.state.account)
const ownersReady = ref(false)
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

// Fetch reference catalog pages (isReference: true, type: datasets)
const catalogReferencesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'datasets', isReference: true }, notifError: false }
)

// Fetch user's catalog pages for duplication
const catalogPagesUserFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'datasets' }, notifError: false }
)

// Pages list for step 2 (references or user pages)
const pagesListForStep2 = computed(() => {
  if (actionType.value === 'reference') return referencesFetch.data.value?.results || []
  if (actionType.value === 'duplicate') return homePagesUserFetch.data.value?.results || []
  return []
})

// Catalog pages list for step 4 (references or user catalog pages)
const catalogPagesListForStep = computed(() => {
  if (catalogActionType.value === 'reference') return catalogReferencesFetch.data.value?.results || []
  if (catalogActionType.value === 'duplicate') return catalogPagesUserFetch.data.value?.results || []
  return []
})

const isNextButtonDisabled = computed(() => {
  if (step.value === 'source') return selectedPageId.value === undefined
  if (step.value === 'catalog-source') return selectedCatalogPageId.value === undefined
  if (step.value === 'information') return !valid.value || !newPortalTitle.value
  return false
})

/** `True` if the active account isn't in a department and his organization has departments */
const hasDepartments = computedAsync(async (): Promise<boolean> => {
  if (session.state.account.department || session.state.account.type === 'user') return false
  const org = await $fetch<{ departments?: any[] }>(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath })
  return !!org.departments?.length
}, false)

const selectAction = (type: 'blank' | 'reference' | 'duplicate') => {
  actionType.value = type
  selectedPageId.value = undefined

  if (type === 'blank') {
    // Skip source step, go directly to catalog action
    step.value = 'catalog-action'
  } else {
    // Go to source step to select a page
    step.value = 'source'
  }
}

const selectPage = (pageId: string) => {
  selectedPageId.value = pageId
  step.value = 'catalog-action' // Go to catalog action step
}

const selectCatalogAction = (type: 'none' | 'blank' | 'reference' | 'duplicate') => {
  catalogActionType.value = type
  selectedCatalogPageId.value = undefined

  if (type === 'none' || type === 'blank') {
    // Skip catalog source step, go directly to owner or information
    step.value = hasDepartments.value ? 'owner' : 'information'
  } else {
    // Go to catalog source step to select a catalog page
    step.value = 'catalog-source'
  }
}

const selectCatalogPage = (pageId: string) => {
  selectedCatalogPageId.value = pageId
  step.value = hasDepartments.value ? 'owner' : 'information' // Go to next step (owner or information)
}

const goToPreviousStep = () => {
  if (step.value === 'source') {
    step.value = 'action'
  } else if (step.value === 'catalog-action') {
    if (actionType.value === 'blank') step.value = 'action'
    else step.value = 'source'
  } else if (step.value === 'catalog-source') {
    step.value = 'catalog-action'
  } else if (step.value === 'owner') {
    if (catalogActionType.value === 'blank' || catalogActionType.value === 'none') {
      step.value = 'catalog-action'
    } else {
      step.value = 'catalog-source'
    }
  } else if (step.value === 'information') {
    if (hasDepartments.value) {
      step.value = 'owner'
    } else if (catalogActionType.value === 'blank' || catalogActionType.value === 'none') {
      step.value = 'catalog-action'
    } else {
      step.value = 'catalog-source'
    }
  }
}

const goToNextStep = () => {
  if (step.value === 'information') createPortal.execute()
  else if (step.value === 'source') step.value = 'catalog-action'
  else if (step.value === 'catalog-source') step.value = hasDepartments.value ? 'owner' : 'information'
  else if (step.value === 'owner') step.value = 'information'
}

const createPortal = useAsyncAction(
  async () => {
    if (!newPortalTitle.value) return

    const menu = { children: [{ type: 'standard', subtype: 'home', title: t('home') }] }
    if (catalogActionType.value && catalogActionType.value !== 'none') {
      menu.children.push({ type: 'standard', subtype: 'datasets', title: t('datasets') })
    }
    menu.children.push({ type: 'standard', subtype: 'applications', title: t('applications') })

    // Step 1: Create the portal
    const portal = await $fetch<Portal>($apiPath + '/portals', {
      method: 'POST',
      body: {
        owner: newOwner.value,
        staging: newPortalStaging.value,
        config: { title: newPortalTitle.value, menu }
      }
    })

    // Step 2: Create the home page with sourcePageId for duplication (handled by API)
    await $fetch('/pages', {
      method: 'POST',
      body: {
        owner: newOwner.value,
        type: 'home',
        sourcePageId: selectedPageId.value, // Source page ID to duplicate (optional)
        portals: [portal._id],
        config: {
          title: t('home') + ' - ' + newPortalTitle.value,
          elements: []
        }
      }
    })

    // Step 3: Create the datasets catalog page if requested (optional)
    if (catalogActionType.value && catalogActionType.value !== 'none') {
      await $fetch('/pages', {
        method: 'POST',
        body: {
          owner: newOwner.value,
          type: 'datasets',
          sourcePageId: selectedCatalogPageId.value, // Source catalog page ID to duplicate (optional)
          portals: [portal._id],
          config: {
            title: t('datasetsCatalog') + ' - ' + newPortalTitle.value,
            elements: []
          }
        }
      })
    }

    // Redirect to the portal page
    await router.replace({ path: `/portals/${portal._id}` })
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
    datasets: Datasets
    applications: Applications
    portalInformation: Portal information
    next: Next
    portalTitle: Portal title
    portalTitleRequired: Portal title is required
    portalStaging: Pre-production portal
    previous: Previous
    selectAction: Choose home page option
    selectReference: Select a reference template
    selectPageToDuplicate: Select a page to duplicate
    selectOwner: Select owner
    selectHomePageAction: Choose home page
    selectCatalogAction: Choose datasets catalog
    selectCatalogReference: Select a catalog template
    selectCatalogToDuplicate: Select a catalog to duplicate
    noCatalog: No catalog
    noCatalogDescription: Do not create a datasets catalog page
    catalogReferenceTemplate: Reference template
    catalogReferenceTemplateDescription: Use a reference datasets catalog template
    blankCatalog: Blank page
    blankCatalogDescription: Start with an empty datasets catalog
    duplicateCatalog: Duplicate existing catalog
    duplicateCatalogDescription: Copy an existing datasets catalog
    datasetsCatalog: Datasets catalog

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
    datasets: Jeux de données
    applications: Visualisations
    portalInformation: Informations du portail
    next: Suivant
    portalTitle: Titre du portail
    portalTitleRequired: Le titre du portail est requis
    portalStaging: Portail de pré-production
    previous: Précédent
    selectAction: Choisir une option de page d'accueil
    selectReference: Sélectionner un modèle de référence
    selectPageToDuplicate: Sélectionner une page à dupliquer
    selectOwner: Sélection du propriétaire
    selectHomePageAction: Choisir la page d'accueil
    selectCatalogAction: Choisir le catalogue de données
    selectCatalogReference: Sélectionner un modèle de catalogue
    selectCatalogToDuplicate: Sélectionner un catalogue à dupliquer
    noCatalog: Pas de catalogue
    noCatalogDescription: Ne pas créer de page catalogue de données
    catalogReferenceTemplate: Modèle de référence
    catalogReferenceTemplateDescription: Utiliser un modèle de catalogue de données de référence
    blankCatalog: Page blanche
    blankCatalogDescription: Commencer avec un catalogue de données vide
    duplicateCatalog: Dupliquer un catalogue existant
    duplicateCatalogDescription: Copier un catalogue de données existant
    datasetsCatalog: Catalogue de données

</i18n>
