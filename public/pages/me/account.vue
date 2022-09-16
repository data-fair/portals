<template lang="html">
  <v-container style="max-width:640px !important;">
    <v-iframe :src="sdUrl" />
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
    ...mapGetters(['directoryUrl']),
    sdUrl () {
      return `${this.directoryUrl}/me?embed=true&primary=${encodeURIComponent(this.config.themeColor)}&fluid=true`
    }
  }
}
</script>
