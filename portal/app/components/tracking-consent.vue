<template>
  <template v-if="requiresConsent">
    <p>{{ t('trackingMessage') }}</p>
    <v-switch
      :model-value="cookieTrack === 'yes'"
      :label="t('authorizeTracking')"
      @update:model-value="toggleCookieTrack"
    />
  </template>
</template>

<script setup lang="ts">

const { t } = useI18n()
const { portal } = usePortalStore()
const { requiresConsent, cookieTrack } = useAnalyticsInfo(portal.value)

const toggleCookieTrack = () => {
  if (cookieTrack.value === 'yes') cookieTrack.value = 'no'
  else cookieTrack.value = 'yes'
  window.location.reload()
}
</script>

<i18n lang="yaml">
  en:
    trackingMessage: You can opt out of being tracked on this website. This will protect your privacy, but it will also prevent the owner from learning from your actions and creating a better experience for you and other users.
    authorizeTracking: Authorize audience metrics collection
  fr:
    trackingMessage: Vous pouvez vous opposer au suivi de votre navigation sur ce site web. Cela protégera votre vie privée, mais empêchera également le propriétaire d'apprendre de vos actions et de créer une meilleure expérience pour vous et les autres utilisateurs.
    authorizeTracking: Autoriser la mesure d'audience
</i18n>
