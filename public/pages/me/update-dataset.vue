<template lang="html">
  <v-iframe
    title="Contribuer"
    :src="updateDatasetUrl"
    :query-params-extra="queryParamsExtra"
    :query-params-exclude="queryParamsExclude"
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
    },
    queryParamsExtra () {
      return {
        primary: this.readablePrimaryColor,
        publicationSite: `data-fair-portals:${this.portal._id}`,
        owner: this.ownerFilter
      }
    },
    queryParamsExclude () {
      return ['portalId']
    }
  }
}
</script>
