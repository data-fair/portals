<template lang="html">
  <d-frame-wrapper
    iframe-title="Traitements"
    :src="processingsListUrl"
    :height="`${windowHeight - 64}px`"
    resize="no"
    sync-path="/me/processings/"
    sync-params
    emit-iframe-messages
  />
</template>

<script>
const { mapState, mapGetters } = require('vuex')

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
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
      return `${this.processingsUrl}/processings/?owner=${encodeURIComponent(this.ownerFilter)}`
    }
  },
  methods: {
    // receiving a message from the iframe
    onMessage (message) {
      // the iframe requests that we display a breadcrumb
      // we mirror its internal paths by using them as a "to" query param for our own current page
      if (message.breadcrumbs) {
        const localBreadcrumbs = message.breadcrumbs
          .map(b => ({ ...b, exact: true, to: b.to && { path: this.$route.path, query: { p: this.getBreadcrumbPath(b.to) } } }))
        this.$store.dispatch('childBreadcrumbs', localBreadcrumbs)
      }
    },
    getBreadcrumbPath (to) {
      if (to === '/processings/' || to === '/processings') return undefined
      if (to.startsWith('/processings')) return to.replace('/processings/', './')
    }
  }
}
</script>
