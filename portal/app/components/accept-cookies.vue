<template>
  <v-bottom-sheet
    v-model="show"
    :max-width="600"
    content-class="rounded-t-lg"
    persistent
    inset
  >
    <v-sheet class="text-center rounded-t-lg pa-6">
      <p>
        {{ t('cookieMessage', { hostname }) }}
      </p>
      <p class="mt-4">
        <i18n-t keypath="privacyPolicyMessage">
          <nuxt-link to="/privacy-policy">
            {{ t('privacyPolicyPage') }}
          </nuxt-link>
        </i18n-t>
      </p>
      <div class="d-flex flex-wrap justify-center ga-4 mt-6">
        <v-btn
          color="primary"
          variant="flat"
          @click="save('no')"
        >
          {{ t('refuse') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="save('yes')"
        >
          {{ t('accept') }}
        </v-btn>
      </div>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script setup lang="ts">

const show = ref(false)
const { t } = useI18n()
const { portal } = usePortalStore()
const { requiresConsent, cookieTrack } = useAnalyticsInfo(portal.value)
const hostname = window.location.hostname

if (requiresConsent && cookieTrack.value === undefined) show.value = true

const save = (choice: 'yes' | 'no') => {
  cookieTrack.value = choice
  window.location.reload()
}

</script>

<i18n lang="yaml">
  en:
    cookieMessage: The site {hostname} uses cookies to record visit statistics and improve user experience.
    privacyPolicyMessage: Your choice is remembered for 1 year. You can change it at any time on the {0} of this site.
    privacyPolicyPage: privacy policy page
    refuse: Refuse audience metrics
    accept: Accept audience metrics
  fr:
    cookieMessage: Le site {hostname} utilise des cookies pour réaliser des statistiques de visite et améliorer l'expérience utilisateur.
    privacyPolicyMessage: Votre choix est conservé pendant 1 an. Vous pouvez le modifier à tout moment sur la {0} du site.
    privacyPolicyPage: page de politique de confidentialité
    refuse: Refuser la mesure d'audience
    accept: Accepter la mesure d'audience
</i18n>
