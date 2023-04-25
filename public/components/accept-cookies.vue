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
        Le site {{ publicUrl.split('://').pop().replace('/','') }} utilise des cookies pour réaliser des
        statistiques de visite et améliorer l'expérience utilisateur.
      </p>
      <v-row>
        <v-spacer />
        <v-col
          :cols="12"
          :sm="7"
        >
          <v-switch
            v-if="config.analytics && config.analytics.type !== 'matomo'"
            :input-value="!$cookies.get('df_portal_track_opt_out')"
            :true-value="true"
            label="Autoriser la mesure d'audience"
            @change="toggle"
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
        @click="hide()"
      >
        Ok
      </v-btn>
    </v-sheet>
  </v-bottom-sheet>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      show: false
    }
  },
  computed: {
    ...mapState(['config', 'publicUrl'])
  },
  created () {
    if (
      this.config.analytics &&
      this.config.analytics.type !== 'none' &&
      !this.config.analytics.anonymized &&
      !this.$cookies.get('df_portal_track')
    ) {
      this.show = true
    } else if (this.$cookies.get('df_portal_track')) {
      this.$cookies.set('df_portal_track', '1', { maxAge: 60 * 60 * 24 * 365, sameSite: true, path: '/' })
    }
  },
  methods: {
    hide () {
      this.$cookies.set('df_portal_track', '1', { maxAge: 60 * 60 * 24 * 365, sameSite: true, path: '/' })
      this.show = false
    },
    toggle () {
      if (!this.$cookies.get('df_portal_track_opt_out')) {
        this.$cookies.set('df_portal_track_opt_out', '1', { maxAge: 60 * 60 * 24 * 365, sameSite: true, path: '/' })
      } else {
        this.$cookies.remove('df_portal_track_opt_out', { path: '/' })
      }
      this.$router.go()
    }
  }
}
</script>

<style lang="css"></style>
