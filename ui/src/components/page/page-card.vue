<template>
  <custom-router-link :to="pageLink">
    <card-shell
      :title="page.title"
      :owner="showAll || !!(page.owner.department && !session.state.account.department) ? page.owner : undefined"
    >
      <!-- Page type and group -->
      <div
        class="d-flex ga-4"
        style="min-width: 0"
      >
        <card-meta-line
          v-if="page.type"
          :icon="mdiInformationOutline"
          :text="t('pageType.' + page.type)"
        />
        <card-meta-line
          v-if="page.config.genericMetadata?.group"
          :icon="mdiFolderInformationOutline"
          :text="page.config.genericMetadata.group.title"
        />
      </div>

      <!-- Page portals/requested portals -->
      <card-sites
        :sites="sites(page.portals)"
        :requested="sites(page.requestedPortals)"
      />

      <template #footer>
        <!-- Modification and creation dates -->
        <card-dates
          :updated-at="page.updatedAt"
          :created-at="page.createdAt"
        />
      </template>
    </card-shell>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import { mdiFolderInformationOutline, mdiInformationOutline } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')

const { page, portalId, portalsById = {} } = defineProps<{
  page: Page
  portalId?: string
  // title and url of the portals, fetched once by the list
  portalsById?: Record<string, { title: string, url: string }>
}>()

const sites = (ids?: string[]) => (ids ?? []).map(id => portalsById[id]).filter(p => !!p)

const pageLink = computed(() => {
  const base = `/pages/${page._id}`
  if (portalId) return `${base}?portal=${portalId}`
  return base
})
</script>

<i18n lang="yaml">
  en:
    pageType:
      home: Home
      contact: Contact
      accessibility: Accessibility
      terms-of-service: Terms of Service
      legal-notice: Legal Notice
      privacy-policy: Privacy policy
      cookie-policy: Cookie Policy
      datasets: Datasets Catalog
      applications: Applications Catalog
      reuses: Reuses Catalog
      event-catalog: Events Catalog
      news-catalog: News Catalog
      event: Event
      news: News
      generic: Custom content
  fr:
    pageType:
      home: Accueil
      contact: Contact
      accessibility: Accessibilité
      terms-of-service: Conditions générales d'utilisation
      legal-notice: Mentions légales
      privacy-policy: Politique de confidentialité
      cookie-policy: Politique de cookies
      datasets: Catalogue de données
      applications: Catalogue de visualisations
      reuses: Catalogue de réutilisations
      event-catalog: Catalogue d'événements
      news-catalog: Catalogue d'actualités
      event: Événement
      news: Actualité
      generic: Contenu libre
</i18n>
