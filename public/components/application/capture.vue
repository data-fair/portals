<template>
  <div v-if="meta['df:sync-state']">
    <v-btn
      v-if="config.applicationActionsDisplay === 'button'"
      text
      x-small
      :loading="downloading"
      color="primary"
      @click="download"
    >
      <v-icon small>
        mdi-camera
      </v-icon>&nbsp;Export
    </v-btn>
    <action-icon
      v-else
      title="Télécharger une capture"
      icon="mdi-camera"
      :loading="downloading"
      @click="download"
    />
  </div>
</template>

<script>
import fileDownload from 'js-file-download'
import { mapState, mapGetters } from 'vuex'

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
    ...mapState(['config']),
    ...mapGetters(['dataFairUrl', 'isPublished']),
    applicationRef () {
      return this.isPublished ? this.application.slug : this.application.id
    },
    href () {
      const url = new URL(`${this.dataFairUrl}/api/v1/applications/${this.applicationRef}/capture`)
      url.searchParams.set('width', this.meta['df:capture-width'] || '1280')
      url.searchParams.set('height', this.meta['df:capture-height'] || '720')
      url.searchParams.set('updatedAt', this.application.updatedAt)
      if (this.syncedState && this.syncedState) {
        const stateUrl = new URL(this.syncedState)
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
      fileDownload(res.data, this.applicationRef + '.' + res.headers['content-type'].split('/').pop())
      this.downloading = false
    }
  }
}
</script>

<style>

</style>
