<template lang="html">
  <d-frame-wrapper
    v-if="activeAccount.type === 'organization'"
    iframe-title="Gestion de l'organisation"
    :src="sdUrl"
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
    ...mapState(['config', 'publicUrl', 'mainPublicUrl']),
    ...mapGetters(['directoryUrl']),
    ...mapGetters('session', ['activeAccount']),
    sdUrl () {
      return `${this.directoryUrl}/organization/${this.activeAccount.id}?redirect=${encodeURIComponent(this.publicUrl + '/me/account')}&main_redirect=${encodeURIComponent(this.mainPublicUrl + '/data-fair')}`
    }
  },
  created () {
    if (this.activeAccount.type !== 'organization') this.$router.push('/me/api-keys')
  }
}
</script>
