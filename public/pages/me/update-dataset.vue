<template lang="html">
  <d-frame-wrapper
    iframe-title="Contribuer"
    :src="updateDatasetUrl"
    class="fill-height"
    resize="no"
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
    ...mapGetters(['dataFairUrl', 'readablePrimaryColor']),
    ...mapState('session', ['user']),
    ownerFilter () {
      const owner = this.config.owner
      let ownerFilter = `${owner.type}:${owner.id}`
      if (owner.department) ownerFilter += `:${owner.department}`
      return ownerFilter
    },
    updateDatasetUrl () {
      return `${this.dataFairUrl}${process.env.embeds.updateDataset}?primary=${encodeURIComponent(this.readablePrimaryColor)}&publicationSite=${encodeURIComponent(`data-fair-portals:${this.portal._id}`)}&owner=${encodeURIComponent(this.ownerFilter)}`
    }
  }
}
</script>
