<template>
  <v-text-field
    :model-value="page?.title"
    :label="t('changeTitle.label')"
    :hint="t('changeTitle.hint')"
    class="mb-4"
    persistent-hint
    clearable
    @update:model-value="(val) => patchPage.execute({ title: val || '' })"
  />

  <v-alert
    v-if="page && session.state.user.adminMode"
    variant="outlined"
    density="compact"
    color="admin"
    class="mb-4 py-0"
  >
    <v-checkbox
      :model-value="page.isReference"
      :label="t('referenceCheckbox')"
      color="admin"
      hide-details
      @click="patchPage.execute({ isReference: !page.isReference })"
    />
  </v-alert>

  <v-list-item
    :prepend-icon="mdiInformationOutline"
    :title="t('pageType.title')"
    :subtitle="t('pageType.' + (page?.type || 'generic')) + (page?.config.genericMetadata?.group?.title ? ' ' + t('pageGroup', { groupTitle: page.config.genericMetadata.group.title }) : '')"
  />
</template>

<script setup lang="ts">
import { mdiInformationOutline } from '@mdi/js'

const session = useSessionAuthenticated()
const { t } = useI18n()
const { patchPage, page } = usePageStore()

</script>

<i18n lang="yaml">
  en:
    dateFormat: D MMM YYYY at HH:mm
    pageGroup: belonging to the "{groupTitle}" group.
    pageType:
      title: Page Type
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
    referenceCheckbox: Set this page as reference template
  fr:
    changeTitle:
      label: Titre affiché dans le back-office (non visible sur le portail).
      hint: Par défaut, il est synchronisé avec le titre de la configuration de la page. Si vous le modifiez, la synchronisation est rompue. Pour la rétablir, videz simplement le champ.
    dateFormat: D MMM YYYY à HH:mm
    pageGroup: appartenant au groupe "{groupTitle}".
    pageType:
      title: Type de page
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
    referenceCheckbox: Définir cette page comme modèle de référence
</i18n>
