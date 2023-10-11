<template lang="html">
  <v-iframe
    title="Traitements"
    :src="processingsListUrl"
    :query-params-extra="{
      primary: readablePrimaryColor,
      owner: ownerFilter
    }"
    :query-params-exclude="['portalId']"
    :sync-state="true"
    @message="onMessage"
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
    ...mapGetters(['processingsUrl', 'readablePrimaryColor']),
    ...mapState('session', ['user']),
    ownerFilter () {
      const owner = this.config.owner
      let ownerFilter = `${owner.type}:${owner.id}`
      if (owner.department) ownerFilter += `:${owner.department}`
      return ownerFilter
    },
    processingsListUrl () {
      return `${this.processingsUrl}/processings/`
    }
  },
  methods: {
    // receiving a message from the iframe
    onMessage (message) {
      console.log('MESSAGE', message)
      // the iframe requests that we display a breadcrumb
      // we mirror its internal paths by using them as a "to" query param for our own current page
      if (message.breadcrumbs) {
        const localBreadcrumbs = message.breadcrumbs
          .map(b => ({ ...b, exact: true, to: b.to && { path: this.$route.path, query: { p: this.getBreadcrumbPath(b.to) } } }))
        this.$store.dispatch('childBreadcrumbs', localBreadcrumbs)
      }
    },
    getBreadcrumbPath (to) {
      if (to === '/processings/') return undefined
      if (to.startsWith('/processings')) return to.replace('/processings/', './')
    }
  }
}
</script>
