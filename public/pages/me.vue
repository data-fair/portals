<template lang="html">
  <v-iframe :src="embedUrl" />
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
      embedUrl() {
        return `${process.env.directoryUrl}/me?embed=true&primary=${encodeURIComponent(this.config.themeColor)}`
      },
    },
  }
</script>
