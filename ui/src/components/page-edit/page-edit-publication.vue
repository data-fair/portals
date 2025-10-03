<template>
  <v-alert
    v-if="!portals?.length"
    type="warning"
    variant="outlined"
    :title="t('noPortal')"
  >
    <template #append>
      <v-btn
        v-if="session.state.user.adminMode"
        to="/portals/new"
        color="primary"
      >
        {{ t('createPortal') }}
      </v-btn>
    </template>
  </v-alert>
  <template v-else-if="page">
    <v-alert
      v-if="warnings.length"
      type="warning"
      variant="outlined"
      :title="t('warning.title')"
    >
      <p
        v-for="(warning,i) in warnings"
        :key="i"
      >
        {{ warning }}
      </p>
    </v-alert>
    <p v-else>
      {{ t('publishThisPage') }}
    </p>
    <v-list lines="three">
      <v-list-item
        v-for="(portal,i) in portals"
        :key="i"
      >
        <v-list-item-title>
          <a
            v-if="portal.ingress"
            :href="portal.ingress?.url"
          >{{ portal.title }}</a>
          <template v-else>
            {{ portal.title }}
          </template>
        </v-list-item-title>
        <v-list-item-subtitle
          v-if="page.owner.department"
          class="mb-2"
        >
          <span>{{ page.owner.name }}</span>
          <span v-if="portal.owner.department"> - {{ portal.owner.departmentName || portal.owner.department }}</span>
        </v-list-item-subtitle>
        <v-list-item-subtitle
          v-if="portal.ingress && page.portals.includes(portal._id)"
          class="mb-2"
        >
          <a :href="portal.ingress.url + '/pages/' + page.slug">
            {{ portal.ingress.url + '/pages/' + page.slug }}
          </a>
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          <!-- Warning for home page that cannot be unpublished -->
          <v-alert
            v-if="page.type === 'home' && isPublished(portal)"
            class="mt-2"
            density="compact"
            type="warning"
            variant="outlined"
            :text="t('standardPage.cannotUnpublishHome')"
          />
          <!-- Warning for conflicting standard page -->
          <v-alert
            v-if="['home', 'contact', 'privacy-policy'].includes(page.type) && !isPublished(portal) && getExistingPageOnPortal(portal)"
            class="mt-2"
            density="compact"
            type="warning"
            variant="outlined"
            :text="t('standardPage.willReplace', { pageType: t(`pageType.${page.type}`), pageTitle: getExistingPageOnPortal(portal)!.config.title })"
          />
          <v-row class="my-0">
            <v-switch
              hide-details
              density="compact"
              :model-value="isPublished(portal)"
              :disabled="(warnings.length && !isPublished(portal)) || !canPublish(portal) || !canUnpublish(portal)"
              :label="t('published')"
              class="mt-0 ml-6"
              @update:model-value="togglePortals(portal)"
            />
            <v-switch
              v-if="page.owner.type === 'organization' && !portal.staging && !page.portals.includes(portal._id)"
              hide-details
              density="compact"
              :model-value="page.requestedPortals.includes(portal._id)"
              :disabled="(warnings.length && !page.requestedPortals.includes(portal._id)) || !canRequestPublication(portal)"
              :label="t('publicationRequested')"
              class="mt-0 ml-6"
              @update:model-value="toggleRequestedPortals(portal._id)"
            />
          </v-row>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </template>
</template>

<script setup lang="ts">
import type { Portal } from '#api/types/portal'
import type { Page } from '#api/types/page'
import { getAccountRole } from '@data-fair/lib-vue/session'

const { t } = useI18n()
const session = useSessionAuthenticated()
const { patchPage, page } = usePageStore()

type PartialPortal = Pick<Portal, '_id' | 'title' | 'ingress' | 'owner' | 'staging'>
const portalsFetch = useFetch<{ results: PartialPortal[] }>($apiPath + '/portals', { query: { select: '_id,title,ingress,owner', size: 10000 } })
const portals = computed(() => portalsFetch.data.value?.results)

// Fetch all standard pages (home, contact, privacy-policy) to detect conflicts
const standardPagesFetch = useFetch<{ results: Pick<Page, '_id' | 'type' | 'portals' | 'config'>[] }>($apiPath + '/pages', {
  query: { type: 'home,contact,privacy-policy', select: '_id,type,portals,config.title', size: 10000 }
})

const warnings = computed(() => {
  const warnings = []
  if (!page.value?.config.description?.length) warnings.push(t('warning.description'))
  if (!page.value?.config.elements.length) warnings.push(t('warning.content'))
  return warnings
})

// Find existing page of the same type on a given portal
const getExistingPageOnPortal = (portal: PartialPortal) => {
  if (!page.value || !standardPagesFetch.data.value?.results) return null

  const currentPage = page.value
  return standardPagesFetch.data.value.results.find(p =>
    p._id !== currentPage._id &&
    p.type === currentPage.type &&
    p.portals.includes(portal._id)
  )
}

const isPublished = (portal: PartialPortal) => {
  if (!page.value) return
  return page.value.portals.includes(portal._id) || (portal.staging && page.value.requestedPortals.includes(portal._id))
}

const canPublish = (portal: PartialPortal) => {
  const role = getAccountRole(session.state, portal.owner)
  if (role === 'contrib' && portal.staging) return true
  return role === 'admin'
}

// Check if unpublishing is allowed (cannot unpublish home page)
const canUnpublish = (portal: PartialPortal) => {
  if (!page.value) return true
  if (page.value.type === 'home' && isPublished(portal)) return false
  return true
}

const canRequestPublication = (portal: PartialPortal) => {
  const role = getAccountRole(session.state, portal.owner)
  return role === 'contrib' || role === 'admin'
}

const togglePortals = (portal: PartialPortal) => {
  if (!page.value) return
  if (portal.staging) return toggleRequestedPortals(portal._id)
  const id = portal._id
  const portals = page.value.portals.includes(id) ? page.value.portals.filter(i => i !== id) : [...page.value.portals, id]
  patchPage.execute({ portals })
}

const toggleRequestedPortals = (id: string) => {
  if (!page.value) return
  const requestedPortals = page.value.requestedPortals.includes(id) ? page.value.requestedPortals.filter(i => i !== id) : [...page.value.requestedPortals, id]
  patchPage.execute({ requestedPortals })
}

</script>

<i18n lang="yaml">
  en:
    createPortal: Create a portal
    noPortal: You have not configured any portal yet.
    publicationRequested: Publication requested by a contributor
    published: Published
    publishThisPage: Publish this page on one or more of your portals.
    warning:
      title: Cannot publish until these warnings are fixed
      content: The page is empty
      description: The description is missing
    standardPage:
      cannotUnpublishHome: You cannot unpublish a home page. You can only replace it with another home page.
      willReplace: 'Publishing this {pageType} on this portal will replace the page "{pageTitle}" with this one.'
    pageType:
      home: home page
      contact: contact page
      privacyPolicy: privacy policy page

  fr:
    createPortal: Créer un portail
    noPortal: Vous n'avez pas encore configuré de portail.
    publicationRequested: Publication demandée par un contributeur
    published: Publié
    publishThisPage: Publiez cette page sur un ou plusieurs de vos portails
    warning:
      title: Publication impossible tant que ces avertissements ne sont pas corrigés
      content: Le contenu de la page est vide
      description: La description n'est pas renseignée
    standardPage:
      cannotUnpublishHome: Vous ne pouvez pas dépublier une page d'accueil. Vous pouvez seulement la remplacer par une autre page d'accueil.
      willReplace: 'Publier cette {pageType} sur ce portail remplacera la page "{pageTitle}" par celle-ci.'
    pageType:
      home: page d'accueil
      contact: page de contact
      privacyPolicy: page de politique de confidentialité
</i18n>
