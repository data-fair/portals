<template>
  <v-bottom-sheet
    v-model="show"
    persistent
    hide-overlay
  >
    <v-sheet
      color="accent"
      class="text-center"
    >
      <v-row
        align="center"
        justify="center"
        class="ma-0"
      >
        <p class="my-3">
          En poursuivant votre navigation sur {{ publicUrl.split('://').pop().replace('/','') }}, vous acceptez l'utilisation des cookies pour réaliser des
          statistiques de visite. Vous pouvez également
          <nuxt-link :to="config.analytics.optOutPage ? { name: 'pages-id', params: {id:config.analytics.optOutPage.id} } : {name : 'privacy-policy'}">
            personnaliser l'utilisation des cookies
          </nuxt-link>
          sur le site.
        </p>
        <v-btn
          text
          @click="acceptCookies()"
        >
          Accepter
        </v-btn>
      </v-row>
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
      this.$cookies.set('df_portal_track', '1', { maxAge: 60 * 60 * 24 * 365, sameSite: true })
    }
  },
  methods: {
    acceptCookies () {
      this.$cookies.set('df_portal_track', '1', { maxAge: 60 * 60 * 24 * 365, sameSite: true })
      this.show = false
    }
  }
}
</script>

<style lang="css"></style>
