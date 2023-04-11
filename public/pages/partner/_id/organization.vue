<template lang="html">
  <v-container style="max-width:640px !important;">
    <v-iframe
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
  layout: 'partner',
  middleware: ['portal-required', 'auth-required'],
  data () {
    return { topics: null }
  },
  computed: {
    ...mapState(['config']),
    ...mapGetters(['directoryUrl']),
    sdUrl () {
      return `${this.directoryUrl}/organization/${this.$route.params.id}?embed=true&primary=${encodeURIComponent(this.config.themeColor)}&fluid=true`
    }
  }
}
</script>
