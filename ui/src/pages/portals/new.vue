<template>
  <v-container
    data-iframe-height
    class="pa-0"
    fluid
  >
    <v-stepper
      v-model="step"
      bg-color="background"
      flat
    >
      <v-stepper-header>
        <v-stepper-item
          value="general-information"
          :title="t('step.generalInformations')"
          :icon="mdiTextBox"
          :color="step === 'general-information' ? 'primary' : ''"
          editable
        />
        <v-divider />
        <v-stepper-item
          value="home"
          :title="t('step.homePage')"
          :icon="mdiHome"
          :color="step === 'home' ? 'primary' : ''"
          editable
        />
        <v-divider />
        <v-stepper-item
          value="datasets-catalog"
          :title="t('step.datasetsCatalog')"
          :icon="mdiDatabase"
          :color="step === 'datasets-catalog' ? 'primary' : ''"
          editable
        />
        <v-divider />
        <v-stepper-item
          value="applications-catalog"
          :title="t('step.applicationsCatalog')"
          :icon="mdiImageMultiple"
          :color="step === 'applications-catalog' ? 'primary' : ''"
          editable
        />
      </v-stepper-header>

      <v-stepper-window>
        <!-- Step 1: Configure general informations -->
        <v-stepper-window-item value="general-information">
          <v-form
            v-model="formValid"
            @submit.prevent
          >
            <v-text-field
              v-model="generalInformations.title.value"
              :label="t('form.title')"
              :rules="[v => !!v || t('form.titleRequired')]"
              hide-details="auto"
              autofocus
              required
            />
            <v-checkbox
              v-model="generalInformations.staging.value"
              :label="t('form.staging')"
              density="comfortable"
              hide-details
            />
          </v-form>

          <!-- Select owner -->
          <template v-if="hasDepartments">
            <h2 class="text-h6 mt-4">
              {{ t('form.owner') }}
            </h2>
            <owner-pick
              v-model="generalInformations.owner.value"
              v-model:ready="ownersReady"
              message=" "
            />
          </template>

          <!-- Default -->
          <h2 class="text-h6">
            {{ t('initFromOtherPortal.title') }}
          </h2>
          <v-row class="d-flex align-stretch mt-2">
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedPortal === undefined ? 'primary' : ''"
                @click="selectPortal()"
              >
                <template #title>
                  <span :class="selectedPortal !== undefined ? 'text-primary' : ''">
                    {{ t('blankPortal') }}
                  </span>
                </template>
              </v-card>
            </v-col>
          </v-row>

          <!-- Reference portals -->
          <template v-if="referencePortalsFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('useReferencePortal.title') }}
            </h2>
            <p>{{ t('useReferencePortal.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="portal in referencePortalsFetch.data.value.results"
                :key="portal._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPortal === portal._id ? 'primary' : ''"
                  @click="selectPortal(portal._id)"
                >
                  <template #title>
                    <span :class="selectedPortal !== portal._id ? 'text-primary' : ''">
                      {{ portal.title }}
                    </span>
                  </template>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <!-- Duplicate existing portal -->
          <template v-if="userPortalsFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('duplicatePortal.title') }}
            </h2>
            <p>{{ t('duplicatePortal.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="portal in userPortalsFetch.data.value.results"
                :key="portal._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPortal === portal._id ? 'primary' : ''"
                  @click="selectPortal(portal._id)"
                >
                  <template #title>
                    <span :class="selectedPortal !== portal._id ? 'text-primary' : ''">
                      {{ portal.title }}
                    </span>
                  </template>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-stepper-window-item>

        <!-- Step 2: Choose home page -->
        <v-stepper-window-item value="home">
          <!-- Blank page -->
          <v-row>
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedPages.home.value === 'blank' ? 'primary' : ''"
                @click="selectPage('home', 'blank')"
              >
                <template #title>
                  <span :class="selectedPages.home.value !== 'blank' ? 'text-primary' : ''">
                    {{ t('blankPage.title') }}
                  </span>
                </template>
                <v-card-text>
                  {{ t('blankPage.description') }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Reference templates -->
          <template v-if="homeReferencesFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('useReferenceTemplate.title') }}
            </h2>
            <p>{{ t('useReferenceTemplate.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="page in homeReferencesFetch.data.value?.results"
                :key="page._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPages.home.value === page._id ? 'primary' : ''"
                  @click="selectPage('home', page._id)"
                >
                  <template #title>
                    <span :class="selectedPages.home.value !== page._id ? 'text-primary' : ''">
                      {{ page.title }}
                    </span>
                  </template>
                  <v-card-text v-if="page.config.description">
                    {{ page.config.description }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <!-- Duplicate existing page -->
          <template v-if="homePagesFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('duplicatePage.title') }}
            </h2>
            <p>{{ t('duplicatePage.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="page in homePagesFetch.data.value?.results"
                :key="page._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPages.home.value === page._id ? 'primary' : ''"
                  @click="selectPage('home', page._id)"
                >
                  <template #title>
                    <span :class="selectedPages.home.value !== page._id ? 'text-primary' : ''">
                      {{ page.title }}
                    </span>
                  </template>
                  <v-card-text v-if="page.config.description">
                    {{ page.config.description }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-stepper-window-item>

        <!-- Step 3: Choose datasets catalog page -->
        <v-stepper-window-item value="datasets-catalog">
          <!-- No catalog / Blank page -->
          <v-row class="d-flex align-stretch">
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedPages.datasets.value === 'none' ? 'primary' : ''"
                @click="selectPage('datasets', 'none')"
              >
                <template #title>
                  <span :class="selectedPages.datasets.value !== 'none' ? 'text-primary' : ''">
                    {{ t('noCatalog.title') }}
                  </span>
                </template>
                <v-card-text>
                  {{ t('noCatalog.description') }}
                </v-card-text>
              </v-card>
            </v-col>
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedPages.datasets.value === 'blank' ? 'primary' : ''"
                @click="selectPage('datasets', 'blank')"
              >
                <template #title>
                  <span :class="selectedPages.datasets.value !== 'blank' ? 'text-primary' : ''">
                    {{ t('blankPage.title') }}
                  </span>
                </template>
                <v-card-text>
                  {{ t('blankPage.description') }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Reference templates -->
          <template v-if="datasetsReferencesFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('useReferenceTemplate.title') }}
            </h2>
            <p>{{ t('useReferenceTemplate.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="page in datasetsReferencesFetch.data.value?.results"
                :key="page._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPages.datasets.value === page._id ? 'primary' : ''"
                  @click="selectPage('datasets', page._id)"
                >
                  <template #title>
                    <span :class="selectedPages.datasets.value !== page._id ? 'text-primary' : ''">
                      {{ page.title }}
                    </span>
                  </template>
                  <v-card-text v-if="page.config.description">
                    {{ page.config.description }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <!-- Duplicate existing page -->
          <template v-if="datasetsPagesFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('duplicatePage.title') }}
            </h2>
            <p>{{ t('duplicatePage.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="page in datasetsPagesFetch.data.value?.results"
                :key="page._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPages.datasets.value === page._id ? 'primary' : ''"
                  @click="selectPage('datasets', page._id)"
                >
                  <template #title>
                    <span :class="selectedPages.datasets.value !== page._id ? 'text-primary' : ''">
                      {{ page.title }}
                    </span>
                  </template>
                  <v-card-text v-if="page.config.description">
                    {{ page.config.description }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-stepper-window-item>

        <!-- Step 4: Choose applications catalog page -->
        <v-stepper-window-item value="applications-catalog">
          <!-- No catalog / Blank page -->
          <v-row class="d-flex align-stretch">
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedPages.applications.value === 'none' ? 'primary' : ''"
                @click="selectPage('applications', 'none')"
              >
                <template #title>
                  <span :class="selectedPages.applications.value !== 'none' ? 'text-primary' : ''">
                    {{ t('noCatalog.title') }}
                  </span>
                </template>
                <v-card-text>
                  {{ t('noCatalog.description') }}
                </v-card-text>
              </v-card>
            </v-col>
            <v-col
              md="4"
              sm="6"
              cols="12"
            >
              <v-card
                class="h-100"
                :color="selectedPages.applications.value === 'blank' ? 'primary' : ''"
                @click="selectPage('applications', 'blank')"
              >
                <template #title>
                  <span :class="selectedPages.applications.value !== 'blank' ? 'text-primary' : ''">
                    {{ t('blankPage.title') }}
                  </span>
                </template>
                <v-card-text>
                  {{ t('blankPage.description') }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Reference templates -->
          <template v-if="applicationsReferencesFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('useReferenceTemplate.title') }}
            </h2>
            <p>{{ t('useReferenceTemplate.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="page in applicationsReferencesFetch.data.value?.results"
                :key="page._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPages.applications.value === page._id ? 'primary' : ''"
                  @click="selectPage('applications', page._id)"
                >
                  <template #title>
                    <span :class="selectedPages.applications.value !== page._id ? 'text-primary' : ''">
                      {{ page.title }}
                    </span>
                  </template>
                  <v-card-text v-if="page.config.description">
                    {{ page.config.description }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>

          <!-- Duplicate existing page -->
          <template v-if="applicationsPagesFetch.data.value?.results?.length">
            <h2 class="text-h6 mt-4">
              {{ t('duplicatePage.title') }}
            </h2>
            <p>{{ t('duplicatePage.description') }}</p>
            <v-row class="d-flex align-stretch mt-2">
              <v-col
                v-for="page in applicationsPagesFetch.data.value?.results"
                :key="page._id"
                md="4"
                sm="6"
                cols="12"
              >
                <v-card
                  class="h-100"
                  :color="selectedPages.applications.value === page._id ? 'primary' : ''"
                  @click="selectPage('applications', page._id)"
                >
                  <template #title>
                    <span :class="selectedPages.applications.value !== page._id ? 'text-primary' : ''">
                      {{ page.title }}
                    </span>
                  </template>
                  <v-card-text v-if="page.config.description">
                    {{ page.config.description }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions
        :prev-text="t('previous')"
        @click:prev="goToPrev()"
      >
        <template #next>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="isNextButtonDisabled"
            :loading="createPortal.loading.value"
            @click="goToNext()"
          >
            {{ step === 'applications-catalog' ? t('create') : t('next') }}
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

import { mdiDatabase, mdiHome, mdiImageMultiple, mdiTextBox } from '@mdi/js'
import { computedAsync } from '@vueuse/core'
import OwnerPick from '@data-fair/lib-vuetify/owner-pick.vue'

const session = useSessionAuthenticated()
const router = useRouter()
const { t } = useI18n()

const step = ref<'general-information' | 'home' | 'datasets-catalog' | 'applications-catalog'>('general-information')

const generalInformations = {
  title: ref<string>(''),
  staging: ref<boolean>(false),
  owner: ref<Account>(session.state.account)
}
const selectedPortal = ref<string | undefined>(undefined)
const selectedPages = {
  home: ref<string | undefined>(undefined),
  datasets: ref<string | undefined>(undefined),
  applications: ref<string | undefined>(undefined)
}

const ownersReady = ref(true)
const formValid = ref(false)

// Fetch reference portals
const referencePortalsFetch = useFetch<{ results: Pick<Portal, '_id' | 'title'>[] }>(
  $apiPath + '/portals',
  { query: { select: '_id,title', isReference: true }, notifError: false }
)

// Fetch user's portals for duplication
const userPortalsFetch = useFetch<{ results: Pick<Portal, '_id' | 'title'>[] }>(
  $apiPath + '/portals',
  { query: { select: '_id,title' }, notifError: false }
)

// Fetch reference home pages
const homeReferencesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'home', isReference: true }, notifError: false }
)

// Fetch user's home pages
const homePagesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'home' }, notifError: false }
)

// Fetch reference datasets pages
const datasetsReferencesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'datasets', isReference: true }, notifError: false }
)

// Fetch user's datasets pages
const datasetsPagesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'datasets' }, notifError: false }
)

// Fetch reference applications pages
const applicationsReferencesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'applications', isReference: true }, notifError: false }
)

// Fetch user's applications pages
const applicationsPagesFetch = useFetch<{ results: Page[] }>(
  $apiPath + '/pages',
  { query: { type: 'applications' }, notifError: false }
)

const selectPortal = (portalId?: string) => {
  selectedPortal.value = portalId
  if (formValid.value) step.value = 'home'
}

const selectPage = (type: 'home' | 'datasets' | 'applications', pageId: string) => {
  selectedPages[type].value = pageId
  if (type === 'home' && formValid.value) step.value = 'datasets-catalog'
  else if (type === 'datasets' && formValid.value) step.value = 'applications-catalog'
}

const isNextButtonDisabled = computed(() => {
  if (step.value === 'general-information') return !formValid.value || !ownersReady.value
  else if (step.value === 'home') return !selectedPages.home.value
  else if (step.value === 'datasets-catalog') return !selectedPages.datasets.value
  else if (step.value === 'applications-catalog') return !selectedPages.applications.value
  return false
})

const goToPrev = () => {
  if (step.value === 'home') step.value = 'general-information'
  else if (step.value === 'datasets-catalog') step.value = 'home'
  else if (step.value === 'applications-catalog') step.value = 'datasets-catalog'
}

const goToNext = () => {
  if (step.value === 'general-information') step.value = 'home'
  else if (step.value === 'home') step.value = 'datasets-catalog'
  else if (step.value === 'datasets-catalog') step.value = 'applications-catalog'
  else if (step.value === 'applications-catalog') createPortal.execute()
}

/** `True` if the active account isn't in a department and his organization has departments */
const hasDepartments = computedAsync(async (): Promise<boolean> => {
  if (session.state.account.department || session.state.account.type === 'user') return false
  const org = await $fetch<{ departments?: any[] }>(`/simple-directory/api/organizations/${session.state.account.id}`, { baseURL: $sitePath })
  return !!org.departments?.length
}, false)

const createPortal = useAsyncAction(
  async () => {
    const portalTitle = generalInformations.title.value.trim()
    const owner = generalInformations.owner.value
    if (!portalTitle || !owner) return

    const menu = { children: [{ type: 'standard', subtype: 'home', title: t('pages.home') }] }
    if (selectedPages.datasets.value && selectedPages.datasets.value !== 'none') {
      menu.children.push({ type: 'standard', subtype: 'datasets', title: t('pages.datasets') })
    }
    if (selectedPages.applications.value && selectedPages.applications.value !== 'none') {
      menu.children.push({ type: 'standard', subtype: 'applications', title: t('pages.applications') })
    }

    // Step 1: Create the portal
    const portal = await $fetch<Portal>($apiPath + '/portals', {
      method: 'POST',
      body: {
        owner,
        staging: generalInformations.staging.value,
        sourcePortalId: selectedPortal.value !== 'blank' ? selectedPortal.value : undefined, // Source page ID to duplicate (optional)
        config: { title: portalTitle, menu: selectedPortal.value !== 'blank' ? undefined : menu } // Init menu only if not duplicating from another portal
      }
    })

    // Step 2: Create the home page with sourcePageId for duplication (handled by API)
    await $fetch('/pages', {
      method: 'POST',
      body: {
        owner,
        type: 'home',
        sourcePageId: selectedPages.home.value !== 'blank' ? selectedPages.home.value : undefined, // Source page ID to duplicate (optional)
        portals: [portal._id],
        title: t('pages.home') + ' - ' + portalTitle,
        config: {
          title: t('pages.home'),
          elements: []
        }
      }
    })

    // Step 3: Create the datasets catalog page if requested (optional)
    if (selectedPages.datasets.value !== 'none') {
      await $fetch('/pages', {
        method: 'POST',
        body: {
          owner,
          type: 'datasets',
          sourcePageId: selectedPages.datasets.value !== 'blank' ? selectedPages.datasets.value : undefined, // Source catalog page ID to duplicate (optional)
          portals: [portal._id],
          title: t('pages.datasetsCatalog') + ' - ' + portalTitle,
          config: {
            title: t('pages.datasetsCatalog'),
            elements: []
          }
        }
      })
    }

    // Step 4: Create the applications catalog page if requested (optional)
    if (selectedPages.applications.value !== 'none') {
      await $fetch('/pages', {
        method: 'POST',
        body: {
          owner,
          type: 'applications',
          sourcePageId: selectedPages.applications.value !== 'blank' ? selectedPages.applications.value : undefined, // Source applications page ID to duplicate (optional)
          portals: [portal._id],
          title: t('pages.applicationsCatalog') + ' - ' + portalTitle,
          config: {
            title: t('pages.applicationsCatalog'),
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
    step:
      generalInformations: General Information
      homePage: Home Page
      datasetsCatalog: Datasets Catalog
      applicationsCatalog: Applications Catalog
    form:
      title: Portal Title
      titleRequired: Portal title is required
      staging: Staging Portal
      owner: Choose the portal owner
    initFromOtherPortal:
      title: Initialize configuration from an existing portal
      description: This will copy the styles, menu and permissions, but not the pages.
    useReferencePortal:
      title: Use a reference portal
      description: Select a pre-designed portal configuration to save time.
    duplicatePortal:
      title: Duplicate one of your existing portals
      description: Create a copy of a portal you already own.
    useReferenceTemplate:
      title: Use a reference template
      description: Select a pre-designed layout to save time.
    duplicatePage:
      title: Duplicate one of your existing pages
      description: Create a copy of a page you already own.
    blankPage:
      title: Blank Page
      description: Start with an empty structure. Requires advanced manual configuration.
    blankPortal: None (Default)
    noCatalog:
      title: Do not include a catalog
      description: You can add it later in the page management.
    next: Next
    previous: Previous
    create: Create Portal
    portals: Portals
    createPortal: Create a Portal
    pages:
      home: Home Page
      datasets: Datasets
      applications: Visualizations
      datasetsCatalog: Datasets Catalog
      applicationsCatalog: Applications Catalog
    errorCreatingPortal: An error occurred while creating the portal.

  fr:
    step:
      generalInformations: Informations générales
      homePage: Page d'accueil
      datasetsCatalog: Catalogue de données
      applicationsCatalog: Catalogue de visualisations
    form:
      title: Titre du portail
      titleRequired: Le titre du portail est obligatoire
      staging: Portail de pré-production
      owner: Choisir le propriétaire du portail
    initFromOtherPortal:
      title: Initialiser la configuration depuis un portail existant
      description: Cela copiera les styles, le menu et les permissions, mais pas les pages.
    useReferencePortal:
      title: Utiliser un portail de référence
      description: Sélectionnez une configuration de portail pré-conçue pour gagner du temps.
    duplicatePortal:
      title: Dupliquer l'un de vos portails existants
      description: Créez une copie d'un portail que vous possédez déjà.
    useReferenceTemplate:
      title: Utiliser un modèle de référence
      description: Sélectionnez une mise en page pré-conçue pour gagner du temps.
    duplicatePage:
      title: Dupliquer l'une de vos pages existantes
      description: Créez une copie d'une page que vous possédez déjà.
    blankPage:
      title: Page blanche
      description: Commencer avec une structure vide. Nécessite une configuration manuelle avancée.
    blankPortal: Aucun (Défaut)
    noCatalog:
      title: Ne pas inclure de catalogue
      description: Vous pourrez l'ajouter plus tard dans la gestion des pages.
    next: Suivant
    previous: Précédent
    create: Créer le portail
    portals: Portails
    createPortal: Créer un portail
    pages:
      home: Page d'accueil
      datasets: Jeux de données
      applications: Visualisations
      datasetsCatalog: Catalogue de données
      applicationsCatalog: Catalogue de visualisations
    errorCreatingPortal: Une erreur est survenue lors de la création du portail.
</i18n>
