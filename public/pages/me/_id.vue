<template lang="html">
  <v-container>
    <v-iframe
      :title="page.title"
      :src="page.href"
    />
  </v-container>
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState } = require('vuex')

export default {
  components: { VIframe },
  layout: 'personal',
  middleware: ['portal-required', 'auth-required'],
  computed: {
    ...mapState(['config']),
    page () {
      return (this.config.personalAccountPages || []).find(p => p.id === this.$route.params.id)
    }
  }
}
</script>
