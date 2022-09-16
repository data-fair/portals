<template lang="html">
  <v-container style="max-width:640px;">
    <h2 class="text-h4 my-4 ml-3">
      <v-icon
        size="36"
        color="primary"
        style="top: -2px"
      >
        mdi-cloud-circle
      </v-icon> Mes clés d'API
    </h2>
    <p class="mt-6">
      Les clés d'API sont utiles pour accéder aux données en levant certaines restrictions imposées aux utilisateurs anonymes ou pour exploiter des données privées auxquelles votre compte a accès.
    </p>
    <v-alert
      type="info"
      outlined
    >
      Pour la plupart des usages simples sur un jeu de données public une clé n'est pas nécessaire.
    </v-alert>
    <v-iframe :src="apiKeysUrl" />
  </v-container>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  layout: 'personal',
  middleware: 'portal-required',
  data () {
    return { topics: null }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['dataFairUrl']),
    ...mapState('session', ['user']),
    apiKeysUrl () {
      return `${this.dataFairUrl}/embed/settings/user/${this.user.id}/api-keys?primary=${encodeURIComponent(this.config.themeColor)}`
    }
  }
}
</script>
