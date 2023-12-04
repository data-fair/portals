<template lang="html">
  <v-container style="max-width:640px !important;">
    <v-iframe
      v-if="activeAccount.type === 'organization'"
      title="Gestion de l'organisation"
      :src="sdUrl"
    />
  </v-container>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  layout: 'personal',
  middleware: ['portal-required', 'auth-required'],
  computed: {
    ...mapState(['config', 'publicUrl', 'mainPublicUrl']),
    ...mapGetters(['directoryUrl']),
    ...mapGetters('session', ['activeAccount']),
    sdUrl () {
      return `${this.directoryUrl}/organization/${this.activeAccount.id}?embed=true&primary=${encodeURIComponent(this.config.themeColor)}&fluid=true&redirect=${encodeURIComponent(this.publicUrl + '/me/account')}&main_redirect=${encodeURIComponent(this.mainPublicUrl + '/data-fair')}`
    }
  },
  created () {
    if (this.activeAccount.type !== 'organization') this.$router.push('/me/api-keys')
  }
}
</script>
