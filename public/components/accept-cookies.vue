<template>
  <v-snackbar
    v-model="show"
    :timeout="-1"
    top
    right
    color="warning"
    multi-line
    vertical
    class="accept-cookies"
  >
    <p>
      Ce site utilise des cookies pour analyser le traffic de ses utilisateurs.
    </p>
    <p>
      Si vous continuez à naviguer vous consentez à l'utilisation de ces cookies.
    </p>
    <div>
      <v-btn
        text
        style="float: right;"
        @click="acceptCookies()"
      >
        Accepter
      </v-btn>
    </div>
  </v-snackbar>
</template>

<script>
import { mapState } from 'vuex'
import Cookies from 'js-cookie'
export default {
  data () {
    return {
      show: false
    }
  },
  computed: {
    ...mapState(['config'])
  },
  created () {
    if (
      this.config.analytics &&
        this.config.analytics.active &&
        !this.config.analytics.anonymized &&
        !Cookies.get('koumoul_portal_track')
    ) {
      this.show = true
    }
  },
  methods: {
    acceptCookies () {
      Cookies.set('koumoul_portal_track', '1')
      this.show = false
    }
  }
}
</script>

<style lang="css">
.accept-cookies.v-snack--vertical .v-snack__content {
  height: auto;
}
</style>
