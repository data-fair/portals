<template lang="html">
  <v-iframe
    title="Contribuer"
    :src="updateDatasetUrl"
    :query-params-extra="{
      primary: readablePrimaryColor,
      publicationSite: `data-fair-portals:${portal._id}`,
      owner: ownerFilter
    }"
    :query-params-exclude="['portalId']"
    :sync-state="true"
  />
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
    ...mapState(['config', 'portal']),
    ...mapGetters(['dataFairUrl', 'readablePrimaryColor']),
    ...mapState('session', ['user']),
    ownerFilter () {
      const owner = this.config.owner
      let ownerFilter = `${owner.type}:${owner.id}`
      if (owner.department) ownerFilter += `:${owner.department}`
      return ownerFilter
    },
    updateDatasetUrl () {
      return `${this.dataFairUrl}/embed/workflow/update-dataset`
    }
  }
}
</script>
