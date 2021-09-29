<template lang="html">
  <no-ssr>
    <v-iframe :src="embedUrl" />
  </no-ssr>
</template>

<script>
  import 'iframe-resizer/js/iframeResizer'
  import VIframe from '@koumoul/v-iframe'
  const { mapState } = require('vuex')

  export default {
    middleware: 'portal-required',
    layout: 'default',
    components: { VIframe },
    computed: {
      ...mapState(['config']),
      ...mapState('session', ['user']),
      embedUrl() {
        return `${this.$store.getters.directoryUrl}/me?embed=true&primary=${encodeURIComponent(this.config.themeColor)}`
      },
    },
    mounted() {
      if (!this.user) this.$router.push('/')
    },
  }
</script>
