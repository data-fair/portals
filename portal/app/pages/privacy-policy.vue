<template>
  <template v-if="requiresConsent">
    <p>{{ t('trackingMessage') }}</p>
    <v-switch
      :model-value="cookieTrack === 'yes'"
      :label="t('authorizeTracking')"
      @update:model-value="toggleCookieTrack"
    />
  </template>

  <!-- Error state -->
  <page-error
    v-if="pageConfigFetch.error.value"
    :status-code="pageConfigFetch.error.value.statusCode || 500"
  />

  <page-elements
    v-else-if="pageConfigFetch.data.value"
    :model-value="pageConfigFetch.data.value.elements"
  />
</template>

<script setup lang="ts">
import type { ImageRef } from '#api/types/image-ref/index.ts'
import type { PageConfig } from '#api/types/page'

const { t } = useI18n()
const { portalConfig } = usePortalStore()
const { setBreadcrumbs } = useNavigationStore()
const { portal } = usePortalStore()
const { requiresConsent, cookieTrack } = useAnalyticsInfo(portal.value)

const pageConfigFetch = await useLocalFetch<PageConfig>('/portal/api/pages/privacy-policy/privacy-policy', { watch: false })

provide('get-image-src', (imageRef: ImageRef, mobile: boolean) => {
  let id = imageRef._id
  if (mobile && imageRef.mobileAlt) id += '-mobile'
  return `/portal/api/pages/privacy-policy/privacy-policy/images/${id}`
})

watch(() => pageConfigFetch.data.value, () => {
  setBreadcrumbs([
    { type: 'standard', subtype: 'privacy-policy', title: pageConfigFetch.data.value?.title }
  ])
}, { immediate: true })

const toggleCookieTrack = () => {
  if (cookieTrack.value === 'yes') cookieTrack.value = 'no'
  else cookieTrack.value = 'yes'
  window.location.reload()
}

usePageSeo({
  title: () => (pageConfigFetch.data.value?.title || t('privacyPolicy')) + ' - ' + portalConfig.value.title,
  description: () => pageConfigFetch.data.value?.description || portalConfig.value.description
})
</script>

<i18n lang="yaml">
  en:
    trackingMessage: You can opt out of being tracked on this website. This will protect your privacy, but it will also prevent the owner from learning from your actions and creating a better experience for you and other users.
    authorizeTracking: authorize audience metrics collection
    privacyPolicy: Privacy Policy
  fr:
    trackingMessage: Vous pouvez vous opposer au suivi de votre navigation sur ce site web. Cela protégera votre vie privée, mais empêchera également le propriétaire d'apprendre de vos actions et de créer une meilleure expérience pour vous et les autres utilisateurs.
    authorizeTracking: autoriser la mesure d'audience
    privacyPolicy: Politique de confidentialité
</i18n>
