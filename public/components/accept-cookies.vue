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
    <p class="mb-0">
      Si vous continuez à naviguer vous consentez à l'utilisation de ces cookies.
    </p>
    <template #action="{ attrs }">
      <v-btn
        text
        v-bind="attrs"
        style="float: right;"
        @click="acceptCookies()"
      >
        Accepter
      </v-btn>
    </template>
  </v-snackbar>
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
    ...mapState(['config'])
  },
  created () {
    if (
      this.config.analytics &&
      !this.config.analytics.anonymized &&
      !this.$cookies.get('df_portal_track')
    ) {
      this.show = true
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

<style lang="css">
.accept-cookies.v-snack--vertical .v-snack__content {
  height: auto;
}
</style>
