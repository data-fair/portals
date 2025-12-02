<template>
  <v-bottom-sheet
    v-model="show"
    persistent
    inset
    :max-width="600"
  >
    <v-sheet
      rounded
      class="text-center pa-6"
    >
      <p>
        {{ t('cookieMessage', { hostname }) }}
      </p>
      <v-row>
        <v-spacer />
        <v-col
          :cols="12"
          :sm="7"
        >
          <v-switch
            v-model="authorizeTracking"
            color="primary"
            :label="t('authorizeTracking')"
          />
        </v-col>
        <v-spacer />
      </v-row>
      <p>
        <i18n-t keypath="privacyPolicyMessage">
          <nuxt-link to="/privacy-policy">
            {{ t('privacyPolicyPage') }}
          </nuxt-link>
        </i18n-t>
      </p>
      <v-btn
        color="primary"
        class="mt-6"
        @click="save()"
      >
        {{ t('ok') }}
      </v-btn>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script setup lang="ts">

const show = ref(false)
const authorizeTracking = ref(true)
const { t } = useI18n()
const { portal } = usePortalStore()
const { requiresConsent, cookieTrack } = useAnalyticsInfo(portal.value)
const hostname = window.location.hostname

if (requiresConsent && cookieTrack.value === undefined) {
  show.value = true
}

const save = () => {
  cookieTrack.value = authorizeTracking.value ? 'yes' : 'no'
  window.location.reload()
}

</script>

<style lang="css"></style>

<i18n lang="yaml">
  en:
    cookieMessage: The site {hostname} uses cookies to record visit statistics and improve user experience.
    authorizeTracking: Authorize audience metrics collection
    privacyPolicyMessage: Your choice is remembered for 1 year. You can change it at any time on the {0} of this site.
    privacyPolicyPage: privacy policy page
    ok: ok
  fr:
    cookieMessage: Le site {hostname} utilise des cookies pour réaliser des statistiques de visite et améliorer l'expérience utilisateur.
    authorizeTracking: Autoriser la mesure d'audience
    privacyPolicyMessage: Votre choix est conservé pendant 1 an. Vous pouvez le modifier à tout moment sur la {0} du site.
    privacyPolicyPage: page de politique de confidentialité
    ok: ok
</i18n>
