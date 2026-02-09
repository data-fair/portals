<template lang="html">
  <v-container>
    <d-frame-wrapper
      :iframe-title="page.title"
      :src="page.href"
      class="fill-height"
      resize="no"
    />
  </v-container>
</template>

<script>
const { mapState } = require('vuex')

export default {
  components: {
    DFrameWrapper: () => process.client ? import('~/components-no-autoload/d-frame-wrapper.vue') : null
  },
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
