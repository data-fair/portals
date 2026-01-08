<template>
  <v-row justify="center">
    <v-col class="text-center">
      <template v-if="statusCode === 404">
        <v-img
          v-if="portalConfig.errorImages?.notFound"
          :src="getErrorImageSrc('notFound')"
          style="max-height: 300px; margin: auto"
        />
        <error-not-found v-else style="max-height: 300px" />
      </template>
      <template v-else-if="statusCode === 401 || statusCode === 403">
        <v-img
          v-if="portalConfig.errorImages?.forbidden"
          :src="getErrorImageSrc('forbidden')"
          style="max-height: 300px; margin: auto"
        />
        <error-forbidden v-else style="max-height: 300px" />
      </template>
      <template v-else>
        <v-img
          v-if="portalConfig.errorImages?.fallback"
          :src="getErrorImageSrc('fallback')"
          style="max-height: 300px; margin: auto"
        />
        <error-server v-else style="max-height: 300px" />
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

const props = defineProps<{
  statusCode: number
  title?: string
  link?: LinkItem
}>()

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const event = useRequestEvent()
if (event) setResponseStatus(event, props.statusCode)

const defaultTitles: Record<number, string> = {
  404: t('notFound'),
  401: t('unauthorized'),
  403: t('forbidden')
}

const title = computed(() => props.title || defaultTitles[props.statusCode] || t('error'))

const getErrorImageSrc = (type: 'notFound' | 'forbidden' | 'fallback') => {
  const image = portalConfig.value.errorImages?.[type]
  if (!image) return ''
  return `/portal/api/images/${image._id}`
}
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
