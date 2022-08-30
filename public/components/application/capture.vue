<template>
  <v-btn
    v-if="meta['df:sync-state']"
    :href="href"
    download
    icon
    v-on="on"
  >
    <v-icon color="primary">
      mdi-camera
    </v-icon>
  </v-btn>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    application: {
      type: Object,
      required: true
    },
    baseApplication: {
      type: Object,
      required: true
    },
    syncedState: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapGetters(['captureUrl']),
    href () {
      const url = new URL(this.application.href + '/capture')
      url.searchParams.set('width', this.meta['df:capture-width'] || '1280')
      url.searchParams.set('height', this.meta['df:capture-height'] || '720')
      url.searchParams.set('updatedAt', this.application.fullUpdatedAt)
      if (this.syncedState && this.syncedState.href) {
        const stateUrl = new URL(this.syncedState.href)
        for (const key of stateUrl.searchParams.keys()) {
          url.searchParams.set('app_' + key, stateUrl.searchParams.get(key))
        }
      }
      return url.href
    },
    meta () {
      return (this.baseApplication && this.baseApplication.meta) || {}
    }
  }
}
</script>

<style>

</style>
