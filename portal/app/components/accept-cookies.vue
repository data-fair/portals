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
        Le site {{ hostname }} utilise des cookies pour réaliser des
        statistiques de visite et améliorer l'expérience utilisateur.
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
            label="Autoriser la mesure d'audience"
          />
        </v-col>
        <v-spacer />
      </v-row>
      <p>
        Votre choix est conservé pendant 1 an. Vous pouvez le modifier à tout moment sur la page de
        <nuxt-link to="/privacy-policy">
          politique de confidentialité
        </nuxt-link>
        du site.
      </p>
      <v-btn
        color="primary"
        class="mt-4"
        @click="save()"
      >
        Ok
      </v-btn>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script setup lang="ts">

const { portal } = usePortalStore()

const show = ref(false)
const authorizeTracking = ref(true)
// can be yes / no / undefined
const cookiePortalTrack = useCookie('df_portal_track', { maxAge: 60 * 60 * 24 * 365, sameSite: true, path: '/' })
const hostname = window.location.hostname

const trackerType = portal.value.config.analytics?.tracker.type
if (
  !portal.value.draft &&
  trackerType && trackerType !== 'none' &&
  !portal.value.config.analytics?.tracker.anonymized &&
  cookiePortalTrack.value === undefined
) {
  show.value = true
}

const save = () => {
  cookiePortalTrack.value = authorizeTracking.value ? 'yes' : 'no'
  window.location.reload()
}

</script>

<style lang="css"></style>
