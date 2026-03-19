<template>
  <custom-router-link :to="pageLink">
    <v-card
      class="h-100"
      link
    >
      <v-card-item class="text-primary">
        <template #title>
          <span
            :title="page.title"
            class="font-weight-bold"
          >
            {{ page.title }}
          </span>
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
              <v-icon
                :icon="mdiInformationOutline"
                :title="t('pageType.title')"
              />
            </template>
            <v-list-item-title>
              {{ t('pageType.' + page.type) }}
            </v-list-item-title>
          </v-list-item>

          <!-- Page group -->
          <v-list-item v-if="page.config.genericMetadata?.group">
            <template #prepend>
              <v-icon
                :icon="mdiFolderInformationOutline"
                :title="t('pageType.group')"
              />
            </template>
            <v-list-item-title>
              {{ page.config.genericMetadata.group.title }}
            </v-list-item-title>
          </v-list-item>

          <!-- Visibility -->
          <v-list-item v-if="visibility === 'public'">
            <template #prepend>
              <v-icon :icon="mdiLockOpen" />
            </template>
            <v-list-item-title>{{ t('public') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-else-if="visibility === 'protected'">
            <template #prepend>
              <v-icon :icon="mdiLockPlus" />
            </template>
            <v-list-item-title>{{ t('protected') }}</v-list-item-title>
          </v-list-item>
          <v-list-item v-else>
            <template #prepend>
              <v-icon :icon="mdiLock" />
            </template>
            <v-list-item-title>{{ t('private') }}</v-list-item-title>
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
import { mdiFolderInformationOutline, mdiInformationOutline, mdiLock, mdiLockOpen, mdiLockPlus } from '@mdi/js'

const { t } = useI18n()
const session = useSessionAuthenticated()
const showAll = useBooleanSearchParam('showAll')
const { visibility } = usePageStore()

const { page, portalId } = defineProps<{
  page: Page
  portalId?: string
}>()

const pageLink = computed(() => {
  const base = `/pages/${page._id}`
  if (portalId) return `${base}?portal=${portalId}`
  return base
})
</script>

<i18n lang="yaml">
  en:
    public: Public
    protected: Protected
    private: Private
    pageType:
      title: Page Type
      group: Group
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
    public: Public
    protected: Protégée
    private: Privée
    pageType:
      title: Type de page
      group: Groupe
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
