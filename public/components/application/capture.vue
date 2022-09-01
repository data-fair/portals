<template>
  <v-btn
    v-if="meta['df:sync-state']"
    icon
    :loading="downloading"
    @click="download"
  >
    <v-icon color="primary">
      mdi-camera
    </v-icon>
  </v-btn>
</template>

<script>
import fileDownload from 'js-file-download'
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
  data: () => ({
    downloading: false
  }),
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
  },
  methods: {
    async download () {
      this.downloading = true
      const res = await this.$axios.get(this.href, { responseType: 'blob' })
      fileDownload(res.data, this.application.id + '.' + res.headers['content-type'].split('/').pop())
      this.downloading = false
    }
  }
}
</script>

<style>

</style>
