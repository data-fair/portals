<template>
  <custom-router-link :to="`/pages/${page._id}`">
    <v-card
      class="h-100"
      link
    >
      <v-card-item class="text-primary">
        <template #title>
          <span class="font-weight-bold">
            {{ page.title }}
          </span>
          <v-tooltip
            v-if="page.title?.length > 20"
            activator="parent"
            location="top left"
            open-delay="300"
            :text="page.title"
          />
        </template>

        <!-- Owner -->
        <template #append>
          <owner-avatar
            v-if="showAll || !!(page.owner.department && !session.state.account.department)"
            :owner="page.owner"
          />
        </template>
      </v-card-item>
      <v-divider />
      <v-card-text class="pa-0">
        <v-list
          density="compact"
          style="background-color: inherit;"
        >
          <!-- Page type -->
          <v-list-item v-if="page.type">
            <template #prepend>
              <v-icon :icon="mdiInformationOutline" />
            </template>
            <v-list-item-title>
              {{ t('pageType.' + page.type) }}
            </v-list-item-title>
          </v-list-item>

          <!-- Page group -->
          <v-list-item v-if="page.config.genericMetadata?.group">
            <template #prepend>
              <v-icon :icon="mdiFolderInformationOutline" />
            </template>
            <v-list-item-title>
              {{ page.config.genericMetadata.group.title }}
            </v-list-item-title>
          </v-list-item>

          <!-- Description (wrapped after 2 lines)-->
          <v-list-item v-if="page.config.description">
            <v-list-item-title class="text-two-lines">
              {{ page.config.description }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </custom-router-link>
</template>

<script setup lang="ts">
import type { Page } from '#api/types/page'
import ownerAvatar from '@data-fair/lib-vuetify/owner-avatar.vue'
import { mdiFolderInformationOutline, mdiInformationOutline } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')

defineProps<{
  page: Page
}>()
</script>

<i18n lang="yaml">
  en:
    pageType:
      title: Page Type
      home: Home
      contact: Contact
      privacy-policy: Privacy policy
      accessibility: Accessibility
      legal-notice: Legal Notice
      cookie-policy: Cookie Policy
      terms-of-service: Terms of Service
      datasets: Datasets Catalog
      applications: Applications Catalog
      reuses: Reuses Catalog
      event: Event
      news: News
      generic: Custom content
  fr:
    pageType:
      title: Type de page
      home: Accueil
      contact: Contact
      privacy-policy: Politique de confidentialité
      accessibility: Accessibilité
      legal-notice: Mentions légales
      cookie-policy: Politique de cookies
      terms-of-service: Conditions générales d'utilisation
      datasets: Catalogue de données
      applications: Catalogue de visualisations
      reuses: Catalogue de réutilisations
      event: Événement
      news: Actualité
      generic: Contenu libre
</i18n>
