<template>
  <v-row justify="center">
    <v-col class="text-center">
      <template v-if="statusCode === 404">
        <error-not-found style="max-height: 300px" />
      </template>
      <template v-else-if="statusCode === 401 || statusCode === 403">
        <error-forbidden style="max-height: 300px" />
      </template>
      <template v-else>
        <error-server style="max-height: 300px" />
      </template>
      <div class="text-h5 my-4">
        {{ title }}
      </div>
      <nav-link
        :link="{
          ...(link ? link : { type: 'standard', subtype: 'home' }),
          title: link?.title ?? t('goToHome'),
          icon: { custom: mdiChevronLeft }
        }"
        :config="portalConfig.navLinksConfig"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { LinkItem } from '#api/types/portal/index.js'
import { mdiChevronLeft } from '@mdi/js'

const { t } = useI18n()

const props = defineProps<{
  statusCode: number
  title?: string
  link?: LinkItem
}>()

const { portalConfig } = usePortalStore()

const defaultTitles: Record<number, string> = {
  404: t('notFound'),
  401: t('unauthorized'),
  403: t('forbidden')
}

const title = computed(() => props.title || defaultTitles[props.statusCode] || t('error'))
</script>

<i18n lang="yaml">
  en:
    notFound: The requested page does not exist.
    unauthorized: You must be logged in to access this page.
    forbidden: You do not have permission to access this page.
    error: An unexpected error has occurred.
    goToHome: Go to Home
  fr:
    notFound: La page demandée n'existe pas.
    unauthorized: Vous devez être authentifié pour accéder à cette page.
    forbidden: Vous n'avez pas les droits pour accéder à cette page.
    error: Une erreur indéterminée s'est produite.
    goToHome: Aller à l'accueil
</i18n>
