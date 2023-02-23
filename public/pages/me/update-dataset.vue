<template lang="html">
  <v-iframe
    title="Contribuer"
    :src="updateDatasetUrl"
    :sync-state="true"
  />
</template>

<script>
import 'iframe-resizer/js/iframeResizer'
import VIframe from '@koumoul/v-iframe'
const { mapState, mapGetters } = require('vuex')

export default {
  components: { VIframe },
  layout: 'personal',
  middleware: ['portal-required', 'auth-required'],
  data () {
    return { topics: null }
  },
  computed: {
    ...mapState(['config', 'portal']),
    ...mapGetters(['dataFairUrl']),
    ...mapState('session', ['user']),
    updateDatasetUrl () {
      const owner = this.config.owner
      let ownerFilter = `${owner.type}:${owner.id}`
      if (owner.department) ownerFilter += `:${owner.department}`
      return `${this.dataFairUrl}/embed/update-dataset?primary=${encodeURIComponent(this.config.themeColor)}&publicationSite=data-fair-portals:${encodeURIComponent(this.portal._id)}&owner=${ownerFilter}`
    }
  }
}
</script>
